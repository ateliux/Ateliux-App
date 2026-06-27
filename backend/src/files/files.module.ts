import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { StorageModule } from '../storage/storage.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [StorageModule, AuditLogsModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
