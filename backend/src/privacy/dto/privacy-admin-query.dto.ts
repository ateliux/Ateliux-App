import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  COOKIE_CONSENT_SOURCES,
  PRIVACY_REQUEST_STATUSES,
  PRIVACY_REQUEST_TYPES,
} from '../privacy.constants';

export class PrivacyAdminQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  anonymousId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: COOKIE_CONSENT_SOURCES })
  @IsOptional()
  @IsIn(COOKIE_CONSENT_SOURCES)
  source?: string;

  @ApiPropertyOptional({ enum: PRIVACY_REQUEST_TYPES })
  @IsOptional()
  @IsIn(PRIVACY_REQUEST_TYPES)
  type?: string;

  @ApiPropertyOptional({ enum: PRIVACY_REQUEST_STATUSES })
  @IsOptional()
  @IsIn(PRIVACY_REQUEST_STATUSES)
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}
