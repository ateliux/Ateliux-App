import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ContactLeadsController } from './contact-leads.controller';
import { ContactLeadsService } from './contact-leads.service';

@Module({
  imports: [MailModule],
  controllers: [ContactLeadsController],
  providers: [ContactLeadsService],
})
export class ContactLeadsModule {}
