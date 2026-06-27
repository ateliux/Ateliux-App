import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FileOrigin, InboxChannel, InboxSource, InboxStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateMessageDto } from '../inbox/dto/create-message.dto';
import type { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createPublic(dto: CreateSupportTicketDto) {
    return this.createTicket(dto, undefined);
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
      include: { inboxConversation: { include: { messages: { include: { attachments: true } } } } },
    });
  }

  async replyClient(user: RequestUser, id: string, dto: CreateMessageDto) {
    const ticket = await this.ensureClientTicket(user, id);
    if (!ticket.inboxConversationId) throw new NotFoundException('Conversation not found.');

    return this.prisma.inboxMessage.create({
      data: {
        conversationId: ticket.inboxConversationId,
        senderId: user.id,
        senderType: 'client',
        body: dto.body,
      },
    }).then(async (message) => {
      if (dto.fileAssetIds?.length) {
        await this.prisma.fileAsset.updateMany({
          where: { id: { in: dto.fileAssetIds }, clientId: user.clientId },
          data: { messageId: message.id },
        });
      }

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

      const message = await tx.inboxMessage.create({
        data: {
          conversationId: conversation.id,
          senderId,
          senderType: dto.clientId ? 'client' : 'public',
          body: dto.message,
        },
      });

      if (dto.fileAssetIds?.length) {
        await tx.fileAsset.updateMany({
          where: dto.clientId
            ? { id: { in: dto.fileAssetIds }, clientId: dto.clientId }
            : { id: { in: dto.fileAssetIds }, origin: FileOrigin.PUBLIC, clientId: null },
          data: { messageId: message.id },
        });
      }

      return tx.supportTicket.create({
        data: {
          clientId: dto.clientId,
          projectId: dto.projectId,
          inboxConversationId: conversation.id,
          subject: dto.subject,
          category: dto.category,
          priority: dto.priority,
          lastMessage: dto.message,
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
}
