import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PreviewStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreatePreviewDto {
  @ApiProperty()
  @IsString()
  clientId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiProperty({ default: 'v1' })
  @IsString()
  version!: string;

  @ApiPropertyOptional({ enum: PreviewStatus })
  @IsOptional()
  @IsEnum(PreviewStatus)
  status?: PreviewStatus;
}
