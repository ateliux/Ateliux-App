import { ApiPropertyOptional } from '@nestjs/swagger';
import { InboxStatus, Priority } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateConversationDto {
  @ApiPropertyOptional({ enum: InboxStatus })
  @IsOptional()
  @IsEnum(InboxStatus)
  status?: InboxStatus;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assigneeId?: string;
}
