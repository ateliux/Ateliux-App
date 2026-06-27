import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../../common/constants/queues';
import { PrismaService } from '../../prisma/prisma.service';

export type AuditJobPayload = {
  actorId?: string;
  actorType: string;
  action: string;
  entityType: string;
  entityId?: string;
  clientId?: string;
  projectId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

@Injectable()
@Processor(QUEUE_NAMES.audit)
export class AuditProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AuditJobPayload>) {
    await this.prisma.auditLog.create({
      data: job.data,
    });
  }
}
