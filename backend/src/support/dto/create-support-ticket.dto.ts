import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  subject!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  message!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileAssetIds?: string[];
}
