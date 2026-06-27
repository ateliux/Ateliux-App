import { Module } from '@nestjs/common';
import { BriefingsController } from './briefings.controller';
import { BriefingsService } from './briefings.service';

@Module({
  controllers: [BriefingsController],
  providers: [BriefingsService],
})
export class BriefingsModule {}
