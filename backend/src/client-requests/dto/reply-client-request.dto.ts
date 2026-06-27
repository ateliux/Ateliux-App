import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ReplyClientRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  response!: string;
}
