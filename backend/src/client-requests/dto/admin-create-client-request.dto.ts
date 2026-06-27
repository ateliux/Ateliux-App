import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { CreateClientRequestDto } from './create-client-request.dto';

export class AdminCreateClientRequestDto extends CreateClientRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  clientId!: string;
}
