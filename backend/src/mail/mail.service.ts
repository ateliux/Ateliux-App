import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../common/constants/queues';

export type MailJobPayload = {
  to: string;
  subject: string;
  template: string;
  data: Record<string, string | number | boolean | null>;
};

@Injectable()
export class MailService {
  constructor(@InjectQueue(QUEUE_NAMES.mail) private readonly mailQueue: Queue<MailJobPayload>) {}

  async enqueue(payload: MailJobPayload) {
    await this.mailQueue.add('send', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    });
  }
}
