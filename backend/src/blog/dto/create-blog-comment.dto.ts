import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(1200)
  body!: string;
}
