import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateApprovalDto {
  @ApiProperty()
  @IsString()
  clientId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiPropertyOptional({ enum: ApprovalStatus })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;
}
