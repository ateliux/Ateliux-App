import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VisibilityStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateScheduleEventDto {
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
  @IsString()
  type!: string;

  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsible?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: VisibilityStatus })
  @IsOptional()
  @IsEnum(VisibilityStatus)
  visibility?: VisibilityStatus;
}
