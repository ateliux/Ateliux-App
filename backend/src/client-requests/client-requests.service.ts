import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FileStatus, InboxChannel, InboxSource, Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { AdminCreateClientRequestDto } from './dto/admin-create-client-request.dto';
import type { CreateClientRequestDto } from './dto/create-client-request.dto';
import type { ReplyClientRequestDto } from './dto/reply-client-request.dto';
import type { UpdateClientRequestDto } from './dto/update-client-request.dto';

@Injectable()
export class ClientRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.clientRequest.findMany({
      where: { clientId: user.clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
        attachments: { include: { fileAsset: true } },
        inboxConversation: { include: { messages: { include: { attachments: true } } } },
      },
    });
  }

  async createClient(user: RequestUser, dto: CreateClientRequestDto) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const clientId = user.clientId;

    return this.prisma.$transaction(async (tx) => {
      const fileAssetIds = await this.resolveClientFileAssetIds(tx, dto.fileAssetIds, clientId, dto.projectId);

      const conversation = await tx.inboxConversation.create({
        data: {
          clientId,
          projectId: dto.projectId,
          channel: InboxChannel.CLIENTS,
          source: InboxSource.REQUEST,
          subject: dto.title,
          preview: dto.description,
          priority: dto.priority,
        },
      });

      await tx.inboxMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          senderType: 'client',
          body: dto.description,
          attachments: fileAssetIds.length
            ? { connect: fileAssetIds.map((id) => ({ id })) }
            : undefined,
        },
        include: { attachments: true },
      });

      return tx.clientRequest.create({
        data: {
          clientId,
          projectId: dto.projectId,
          inboxConversationId: conversation.id,
          title: dto.title,
          description: dto.description,
          category: dto.category,
          priority: dto.priority,
          attachments: fileAssetIds.length
            ? { create: fileAssetIds.map((fileAssetId) => ({ fileAssetId })) }
            : undefined,
        },
        include: {
          project: true,
          attachments: { include: { fileAsset: true } },
          inboxConversation: { include: { messages: { include: { attachments: true } } } },
        },
      });
    });
  }

  findAdminAll() {
    return this.prisma.clientRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        project: true,
        attachments: { include: { fileAsset: true } },
        inboxConversation: { include: { messages: { include: { attachments: true } } } },
      },
    });
  }

  createAdmin(dto: AdminCreateClientRequestDto) {
    return this.prisma.clientRequest.create({
      data: {
        clientId: dto.clientId,
        projectId: dto.projectId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority,
      },
    });
  }

  async update(id: string, dto: UpdateClientRequestDto) {
    await this.ensureExists(id);
    return this.prisma.clientRequest.update({ where: { id }, data: dto });
  }

  async reply(id: string, dto: ReplyClientRequestDto) {
    const request = await this.ensureExists(id);
    await this.prisma.clientRequest.update({
      where: { id },
      data: { response: dto.response, status: RequestStatus.IN_PROGRESS },
    });

    if (request.inboxConversationId) {
      await this.prisma.inboxMessage.create({
        data: {
          conversationId: request.inboxConversationId,
          senderType: 'ateliux',
          body: dto.response,
        },
      });
    }

    return { success: true };
  }

  async convertToStage(id: string) {
    const request = await this.ensureExists(id);
    if (!request.projectId) throw new ForbiddenException('Request has no project to convert.');

    const stage = await this.prisma.projectStage.create({
      data: {
        clientId: request.clientId,
        projectId: request.projectId,
        title: request.title,
        description: request.description,
      },
    });

    await this.prisma.clientRequest.update({
      where: { id },
      data: { status: RequestStatus.IN_PROGRESS },
    });

    return stage;
  }

  private async ensureExists(id: string) {
    const request = await this.prisma.clientRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Client request not found.');
    return request;
  }

  private async resolveClientFileAssetIds(
    tx: Prisma.TransactionClient,
    fileAssetIds: string[] | undefined,
    clientId: string,
    projectId?: string,
  ) {
    const ids = [...new Set(fileAssetIds ?? [])].filter(Boolean);
    if (!ids.length) {
      if (projectId) await this.ensureClientProject(tx, projectId, clientId);
      return ids;
    }

    if (projectId) await this.ensureClientProject(tx, projectId, clientId);

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
