import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterClientDto {
  @ApiProperty({ example: 'Marina Costa' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'marina@empresa.com.br' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Empresa Demo' })
  @IsString()
  @MinLength(2)
  company!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ default: 'Essencial' })
  @IsOptional()
  @IsString()
  plan?: string;
}
