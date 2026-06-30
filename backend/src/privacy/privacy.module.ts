import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [PrivacyController],
  providers: [PrivacyService],
})
export class PrivacyModule {}
