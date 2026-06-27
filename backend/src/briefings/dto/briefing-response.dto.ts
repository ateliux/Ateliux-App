import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class BriefingResponseDto {
  @ApiProperty({ type: Object })
  @IsObject()
  answers!: Record<string, string | number | boolean | null>;
}
