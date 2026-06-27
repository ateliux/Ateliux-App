import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PrepareUploadDto {
  @ApiPropertyOptional({ default: 'ateliux' })
  @IsOptional()
  @IsString()
  folder?: string;
}
