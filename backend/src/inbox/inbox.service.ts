import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FileStatus, InboxStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateConversationDto } from './dto/create-conversation.dto';
import type { CreateMessageDto } from './dto/create-message.dto';
import type { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  findAdminAll() {
    return this.prisma.inboxConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        client: true,
        project: true,
        assignee: { include: { user: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true } },
      },
    });
  }

  async findAdminOne(id: string) {
    const conversation = await this.prisma.inboxConversation.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        assignee: { include: { user: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true } },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');
    return conversation;
  }

  createAdmin(dto: CreateConversationDto) {
    return this.prisma.inboxConversation.create({ data: dto });
  }

  async addAdminMessage(id: string, user: RequestUser, dto: CreateMessageDto) {
    const conversation = await this.findAdminOne(id);
    return this.prisma.$transaction(async (tx) => {
      const fileAssetIds = await this.resolveAdminFileAssetIds(
        tx,
        dto.fileAssetIds,
        conversation.clientId ?? undefined,
        conversation.projectId ?? undefined,
      );

      const message = await tx.inboxMessage.create({
        data: {
          conversationId: id,
          senderId: user.id,
          senderType: 'ateliux',
          body: dto.body,
          attachments: fileAssetIds.length
            ? { connect: fileAssetIds.map((fileAssetId) => ({ id: fileAssetId })) }
            : undefined,
        },
        include: { attachments: true },
      });

      await tx.inboxConversation.update({
        where: { id },
        data: { status: InboxStatus.IN_PROGRESS, preview: dto.body },
      });

      return message;
    });
  }

  async update(id: string, dto: UpdateConversationDto) {
    await this.findAdminOne(id);
    return this.prisma.inboxConversation.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findAdminOne(id);
    await this.prisma.inboxConversation.update({ where: { id }, data: { status: InboxStatus.ARCHIVED } });
    return { success: true };
  }

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.inboxConversation.findMany({
      where: { clientId: user.clientId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true } } },
    });
  }

  async findClientOne(user: RequestUser, id: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const conversation = await this.prisma.inboxConversation.findFirst({
      where: { id, clientId: user.clientId },
      include: { messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true } } },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');
    return conversation;
  }

  async addClientMessage(user: RequestUser, id: string, dto: CreateMessageDto) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const clientId = user.clientId;
    const conversation = await this.findClientOne(user, id);
    return this.prisma.$transaction(async (tx) => {
      const fileAssetIds = await this.resolveClientFileAssetIds(
        tx,
        dto.fileAssetIds,
        clientId,
        conversation.projectId ?? undefined,
      );

      const message = await tx.inboxMessage.create({
        data: {
          conversationId: id,
          senderId: user.id,
          senderType: 'client',
          body: dto.body,
          attachments: fileAssetIds.length
            ? { connect: fileAssetIds.map((fileAssetId) => ({ id: fileAssetId })) }
            : undefined,
        },
        include: { attachments: true },
      });

      await tx.inboxConversation.update({
        where: { id },
        data: { status: InboxStatus.WAITING_CLIENT, preview: dto.body },
      });

      return message;
    });
  }

  private async resolveAdminFileAssetIds(
    tx: Prisma.TransactionClient,
    fileAssetIds: string[] | undefined,
    clientId?: string,
    projectId?: string,
  ) {
    const ids = [...new Set(fileAssetIds ?? [])].filter(Boolean);
    if (!ids.length) return ids;

    const files = await tx.fileAsset.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        status: { not: FileStatus.DELETED },
      },
      select: { id: true, clientId: true, projectId: true },
    });

    if (files.length !== ids.length) {
      throw new BadRequestException('Um ou mais anexos nao existem ou foram removidos.');
    }

    if (clientId) {
      const invalidClientFile = files.find((file) => file.clientId && file.clientId !== clientId);
      if (invalidClientFile) throw new ForbiddenException('Arquivo pertence a outro cliente.');
    }

    if (projectId) {
      const invalidProjectFile = files.find((file) => file.projectId && file.projectId !== projectId);
      if (invalidProjectFile) throw new ForbiddenException('Arquivo pertence a outro projeto.');
    }

    return ids;
  }

  private async resolveClientFileAssetIds(
    tx: Prisma.TransactionClient,
    fileAssetIds: string[] | undefined,
    clientId: string,
    projectId?: string,
  ) {
    const ids = [...new Set(fileAssetIds ?? [])].filter(Boolean);
    if (!ids.length) return ids;

    const files = await tx.fileAsset.findMany({
      where: {
        id: { in: ids },
        clientId,
        deletedAt: null,
        status: { not: FileStatus.DELETED },
      },
      select: { id: true, projectId: true },
    });

    if (files.length !== ids.length) {
      throw new ForbiddenException('Um ou mais arquivos nao pertencem ao cliente autenticado.');
    }

    if (projectId) {
      const invalidProjectFile = files.find((file) => file.projectId && file.projectId !== projectId);
      if (invalidProjectFile) throw new ForbiddenException('Arquivo pertence a outro projeto.');
    }

    return ids;
  }
}
