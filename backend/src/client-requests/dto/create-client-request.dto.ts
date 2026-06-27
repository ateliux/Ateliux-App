import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientRequestDto {
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
  @MinLength(3)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileAssetIds?: string[];
}
