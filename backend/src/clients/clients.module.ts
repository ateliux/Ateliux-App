import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [MailModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
