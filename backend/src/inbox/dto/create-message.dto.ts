import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileAssetIds?: string[];
}
