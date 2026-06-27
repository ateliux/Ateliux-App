import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StageStatus } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectStageDto {
  @ApiProperty()
  @IsString()
  clientId!: string;

  @ApiProperty()
  @IsString()
  projectId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({ enum: StageStatus })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}
