import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '../common/constants/queues';
import { MailService } from './mail.service';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.mail })],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
