import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PRIVACY_REQUEST_TYPES } from '../privacy.constants';

export class CreatePrivacyRequestDto {
  @ApiProperty({ example: 'Marina Costa' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'marina@empresa.com.br' })
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @ApiProperty({ enum: PRIVACY_REQUEST_TYPES })
  @IsIn(PRIVACY_REQUEST_TYPES)
  type!: string;

  @ApiPropertyOptional({ example: 'Gostaria de receber uma copia dos meus dados.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
