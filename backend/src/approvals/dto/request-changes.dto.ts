import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RequestChangesDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  comment!: string;
}
