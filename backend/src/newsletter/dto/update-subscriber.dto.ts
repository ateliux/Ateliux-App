import { ApiPropertyOptional } from '@nestjs/swagger';
import { NewsletterStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriberDto {
  @ApiPropertyOptional({ enum: NewsletterStatus })
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
