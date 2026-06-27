import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BriefingStatus, VisibilityStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBriefingDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({ enum: BriefingStatus })
  @IsOptional()
  @IsEnum(BriefingStatus)
  status?: BriefingStatus;

  @ApiPropertyOptional({ enum: VisibilityStatus })
  @IsOptional()
  @IsEnum(VisibilityStatus)
  visibility?: VisibilityStatus;
}
