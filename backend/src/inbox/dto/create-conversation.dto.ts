import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InboxChannel, InboxSource, Priority } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ enum: InboxChannel })
  @IsEnum(InboxChannel)
  channel!: InboxChannel;

  @ApiProperty({ enum: InboxSource })
  @IsEnum(InboxSource)
  source!: InboxSource;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  subject!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preview?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
