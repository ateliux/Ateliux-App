import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { QUEUE_NAMES } from '../../common/constants/queues';
import type { MailJobPayload } from '../../mail/mail.service';

@Injectable()
@Processor(QUEUE_NAMES.mail)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async process(job: Job<MailJobPayload>) {
    const user = this.config.get<string>('mail.user') ?? '';
    const pass = this.config.get<string>('mail.pass') ?? '';

    if (!user || !pass) {
      this.logger.warn(`SMTP not configured. Skipping mail job ${job.id}.`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('mail.host'),
      port: this.config.getOrThrow<number>('mail.port'),
      secure: this.config.getOrThrow<boolean>('mail.secure'),
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: this.config.getOrThrow<string>('mail.from'),
      to: job.data.to,
      subject: job.data.subject,
      text: `${job.data.template}\n\n${JSON.stringify(job.data.data, null, 2)}`,
    });
  }
}
