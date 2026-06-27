import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InboxStatus } from '@prisma/client';
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
      include: { client: true, project: true, assignee: { include: { user: true } }, messages: true },
    });
  }

  async findAdminOne(id: string) {
    const conversation = await this.prisma.inboxConversation.findUnique({
      where: { id },
      include: { client: true, project: true, messages: { include: { attachments: true } } },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');
    return conversation;
  }

  createAdmin(dto: CreateConversationDto) {
    return this.prisma.inboxConversation.create({ data: dto });
  }

  async addAdminMessage(id: string, user: RequestUser, dto: CreateMessageDto) {
    await this.findAdminOne(id);
    const message = await this.prisma.inboxMessage.create({
      data: {
        conversationId: id,
        senderId: user.id,
        senderType: 'ateliux',
        body: dto.body,
      },
    });
    if (dto.fileAssetIds?.length) {
      await this.prisma.fileAsset.updateMany({
        where: { id: { in: dto.fileAssetIds } },
        data: { messageId: message.id },
      });
    }
    await this.prisma.inboxConversation.update({
      where: { id },
      data: { status: InboxStatus.IN_PROGRESS, preview: dto.body },
    });
    return message;
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
      include: { messages: true },
    });
  }

  async findClientOne(user: RequestUser, id: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const conversation = await this.prisma.inboxConversation.findFirst({
      where: { id, clientId: user.clientId },
      include: { messages: { include: { attachments: true } } },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');
    return conversation;
  }

  async addClientMessage(user: RequestUser, id: string, dto: CreateMessageDto) {
    await this.findClientOne(user, id);
    const message = await this.prisma.inboxMessage.create({
      data: {
        conversationId: id,
        senderId: user.id,
        senderType: 'client',
        body: dto.body,
      },
    });
    if (dto.fileAssetIds?.length) {
      await this.prisma.fileAsset.updateMany({
        where: { id: { in: dto.fileAssetIds }, clientId: user.clientId },
        data: { messageId: message.id },
      });
    }
    await this.prisma.inboxConversation.update({
      where: { id },
      data: { status: InboxStatus.WAITING_CLIENT, preview: dto.body },
    });
    return message;
  }
}
