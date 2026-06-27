import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '../common/constants/queues';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { FilesModule } from '../files/files.module';
import { StorageModule } from '../storage/storage.module';
import { MalwareScanService } from './malware-scan.service';
import { UploadValidationService } from './upload-validation.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [StorageModule, AuditLogsModule, FilesModule, BullModule.registerQueue({ name: QUEUE_NAMES.uploads })],
  controllers: [UploadsController],
  providers: [UploadsService, UploadValidationService, MalwareScanService],
})
export class UploadsModule {}
