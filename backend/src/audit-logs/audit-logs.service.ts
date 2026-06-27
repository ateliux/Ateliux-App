import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateManualHistoryNoteDto } from './dto/create-manual-history-note.dto';

export type CreateAuditLogInput = {
  actorId?: string;
  actorType: string;
  action: string;
  entityType: string;
  entityId?: string;
  clientId?: string;
  projectId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonObject;
};

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorType: input.actorType,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        clientId: input.clientId,
        projectId: input.projectId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { client: true, project: true },
    });
  }

  findClientHistory(user: RequestUser) {
    return this.prisma.auditLog.findMany({
      where: { clientId: user.clientId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { client: true, project: true },
    });
  }

  createManualNote(user: RequestUser, dto: CreateManualHistoryNoteDto) {
    return this.create({
      actorId: user.adminUserId ?? user.id,
      actorType: 'admin',
      action: dto.title ?? 'MANUAL_HISTORY_NOTE',
      entityType: 'HistoryNote',
      clientId: dto.clientId,
      projectId: dto.projectId,
      metadata: {
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: { client: true, project: true },
    });
    if (!log) throw new NotFoundException('Audit log not found.');
    return log;
  }
}
