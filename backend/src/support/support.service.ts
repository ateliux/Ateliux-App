import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FileOrigin, FileStatus, InboxChannel, InboxSource, InboxStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateMessageDto } from '../inbox/dto/create-message.dto';
import type { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createPublic(dto: CreateSupportTicketDto) {
    return this.createTicket({ ...dto, clientId: undefined, projectId: undefined }, undefined);
  }

  async createClient(user: RequestUser, dto: CreateSupportTicketDto) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.createTicket({ ...dto, clientId: user.clientId }, user.id);
  }

  findClientTickets(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.supportTicket.findMany({
      where: { clientId: user.clientId },
      orderBy: { updatedAt: 'desc' },
      include: {
        attachments: { include: { fileAsset: true } },
        inboxConversation: { include: { messages: { include: { attachments: true } } } },
      },
    });
  }

  async replyClient(user: RequestUser, id: string, dto: CreateMessageDto) {
    const ticket = await this.ensureClientTicket(user, id);
    const conversationId = ticket.inboxConversationId;
    if (!conversationId) throw new NotFoundException('Conversation not found.');

    return this.prisma.$transaction(async (tx) => {
      const fileAssetIds = await this.resolveSupportFileAssetIds(
        tx,
        dto.fileAssetIds,
        user.clientId,
        ticket.projectId ?? undefined,
      );

      const message = await tx.inboxMessage.create({
        data: {
          conversationId,
          senderId: user.id,
          senderType: 'client',
          body: dto.body,
          attachments: fileAssetIds.length
            ? { connect: fileAssetIds.map((fileAssetId) => ({ id: fileAssetId })) }
            : undefined,
        },
        include: { attachments: true },
      });

      if (fileAssetIds.length) {
        await tx.supportTicketAttachment.createMany({
          data: fileAssetIds.map((fileAssetId) => ({ supportTicketId: ticket.id, fileAssetId })),
          skipDuplicates: true,
        });
      }

      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: { status: InboxStatus.WAITING_CLIENT, lastMessage: dto.body },
      });

      return message;
    });
  }

  async closeClient(user: RequestUser, id: string) {
    const ticket = await this.ensureClientTicket(user, id);
    return this.prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: InboxStatus.RESOLVED },
    });
  }

  private async createTicket(dto: CreateSupportTicketDto, senderId: string | undefined) {
    return this.prisma.$transaction(async (tx) => {
      const fileAssetIds = await this.resolveSupportFileAssetIds(tx, dto.fileAssetIds, dto.clientId, dto.projectId);

      const conversation = await tx.inboxConversation.create({
        data: {
          clientId: dto.clientId,
          projectId: dto.projectId,
          channel: dto.clientId ? InboxChannel.CLIENTS : InboxChannel.SUPPORT,
          source: InboxSource.SUPPORT,
          subject: dto.subject,
          preview: dto.message,
          priority: dto.priority,
        },
      });

      await tx.inboxMessage.create({
        data: {
          conversationId: conversation.id,
          senderId,
          senderType: dto.clientId ? 'client' : 'public',
          body: dto.message,
          attachments: fileAssetIds.length
            ? { connect: fileAssetIds.map((fileAssetId) => ({ id: fileAssetId })) }
            : undefined,
        },
        include: { attachments: true },
      });

      return tx.supportTicket.create({
        data: {
          clientId: dto.clientId,
          projectId: dto.projectId,
          inboxConversationId: conversation.id,
          subject: dto.subject,
          category: dto.category,
          priority: dto.priority,
          lastMessage: dto.message,
          attachments: fileAssetIds.length
            ? { create: fileAssetIds.map((fileAssetId) => ({ fileAssetId })) }
            : undefined,
        },
        include: {
          attachments: { include: { fileAsset: true } },
          inboxConversation: { include: { messages: { include: { attachments: true } } } },
        },
      });
    });
  }

  private async ensureClientTicket(user: RequestUser, id: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, clientId: user.clientId },
    });
    if (!ticket) throw new NotFoundException('Support ticket not found.');
    return ticket;
  }

  private async resolveSupportFileAssetIds(
    tx: Prisma.TransactionClient,
    fileAssetIds: string[] | undefined,
    clientId?: string,
    projectId?: string | null,
  ) {
    const ids = [...new Set(fileAssetIds ?? [])].filter(Boolean);
    if (!ids.length) {
      if (clientId && projectId) await this.ensureClientProject(tx, projectId, clientId);
      return ids;
    }

    if (clientId && projectId) await this.ensureClientProject(tx, projectId, clientId);

    const files = await tx.fileAsset.findMany({
      where: clientId
        ? {
            id: { in: ids },
            clientId,
            deletedAt: null,
            status: { not: FileStatus.DELETED },
          }
        : {
            id: { in: ids },
            origin: FileOrigin.PUBLIC,
            clientId: null,
            deletedAt: null,
            status: { not: FileStatus.DELETED },
          },
      select: { id: true, projectId: true },
    });

    if (files.length !== ids.length) {
      throw new ForbiddenException('Um ou mais arquivos nao pertencem ao contexto do suporte.');
    }

    const crossProjectFile = projectId
      ? files.find((file) => file.projectId && file.projectId !== projectId)
      : undefined;
    if (crossProjectFile) {
      throw new BadRequestException('Arquivo anexado pertence a outro projeto.');
    }

    return ids;
  }

  private async ensureClientProject(tx: Prisma.TransactionClient, projectId: string, clientId: string) {
    const project = await tx.project.findFirst({
      where: { id: projectId, clientId },
      select: { id: true },
    });
    if (!project) throw new ForbiddenException('Projeto nao pertence ao cliente autenticado.');
  }
}
