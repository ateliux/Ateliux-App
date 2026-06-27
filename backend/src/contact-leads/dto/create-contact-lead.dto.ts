import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactLeadDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentSite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileAssetId?: string;
}
