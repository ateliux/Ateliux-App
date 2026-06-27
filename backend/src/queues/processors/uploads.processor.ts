import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationAudience } from '@prisma/client';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../../common/constants/queues';
import { PrismaService } from '../../prisma/prisma.service';

export type UploadsJobPayload = {
  fileId: string;
  clientId?: string;
  projectId?: string;
  context: string;
  originalName: string;
};

@Injectable()
@Processor(QUEUE_NAMES.uploads)
export class UploadsProcessor extends WorkerHost {
  private readonly logger = new Logger(UploadsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<UploadsJobPayload>) {
    if (job.name !== 'file.pending_review.notification') {
      this.logger.warn(`Unknown uploads job ignored: ${job.name}`);
      return;
    }

    await this.prisma.notification.create({
      data: {
        audience: NotificationAudience.ADMIN,
        clientId: job.data.clientId,
        projectId: job.data.projectId,
        type: 'file.pending_review',
        title: 'Arquivo aguardando revisao',
        body: `${job.data.originalName} precisa de revisao antes de ser disponibilizado.`,
        entityType: 'FileAsset',
        entityId: job.data.fileId,
      },
    });
  }
}
