import { Module } from '@nestjs/common';
import { PreviewsController } from './previews.controller';
import { PreviewsService } from './previews.service';

@Module({
  controllers: [PreviewsController],
  providers: [PreviewsService],
})
export class PreviewsModule {}
