import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '../common/constants/queues';
import { AuditProcessor } from './processors/audit.processor';
import { MailProcessor } from './processors/mail.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { UploadsProcessor } from './processors/uploads.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.mail },
      { name: QUEUE_NAMES.notifications },
      { name: QUEUE_NAMES.audit },
      { name: QUEUE_NAMES.uploads },
    ),
  ],
  providers: [MailProcessor, NotificationProcessor, AuditProcessor, UploadsProcessor],
})
export class QueuesModule {}
