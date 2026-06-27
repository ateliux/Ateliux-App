import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FileContext,
  FileOrigin,
  FileStatus,
  FileUploadedByType,
  FileVisibility,
} from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateFileAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  safeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  extension?: string;

  @ApiProperty()
  @IsString()
  mimeType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detectedMime?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  size!: number;

  @ApiProperty({ default: 'cloudinary' })
  @IsString()
  storageProvider!: string;

  @ApiProperty()
  @IsString()
  storageKey!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cloudinaryPublicId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  secureUrl?: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional({ enum: FileOrigin })
  @IsOptional()
  @IsEnum(FileOrigin)
  origin?: FileOrigin;

  @ApiPropertyOptional({ enum: FileUploadedByType })
  @IsOptional()
  @IsEnum(FileUploadedByType)
  uploadedByType?: FileUploadedByType;

  @ApiPropertyOptional({ enum: FileContext })
  @IsOptional()
  @IsEnum(FileContext)
  context?: FileContext;

  @ApiPropertyOptional({ enum: FileVisibility })
  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;

  @ApiPropertyOptional({ enum: FileStatus })
  @IsOptional()
  @IsEnum(FileStatus)
  status?: FileStatus;
}
