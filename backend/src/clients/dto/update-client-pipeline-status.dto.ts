import { ApiProperty } from '@nestjs/swagger';
import { ClientPipelineStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateClientPipelineStatusDto {
  @ApiProperty({ enum: ClientPipelineStatus })
  @IsEnum(ClientPipelineStatus)
  status!: ClientPipelineStatus;
}
