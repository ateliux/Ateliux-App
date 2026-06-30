import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  imports: [FilesModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
