import { PartialType } from '@nestjs/swagger';
import { CreateFileAssetDto } from './create-file-asset.dto';

export class UpdateFileAssetDto extends PartialType(CreateFileAssetDto) {}
