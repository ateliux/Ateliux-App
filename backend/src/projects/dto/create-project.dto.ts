import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  clientId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsString()
  scope!: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentStage?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  visibleToClient?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerId?: string;
}
