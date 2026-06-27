import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../../common/constants/queues';

export type NotificationJobPayload = {
  title: string;
  recipientId?: string;
  clientId?: string;
  projectId?: string;
};

@Injectable()
@Processor(QUEUE_NAMES.notifications)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<NotificationJobPayload>) {
    this.logger.log(`Notification queued: ${job.data.title}`);
  }
}
