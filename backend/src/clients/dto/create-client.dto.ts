import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  company!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ default: 'Essencial' })
  @IsString()
  plan!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibleId?: string;
}
