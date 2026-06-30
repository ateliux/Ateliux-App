import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { COOKIE_CONSENT_SOURCES } from '../privacy.constants';

export class CreateCookieConsentDto {
  @ApiPropertyOptional({ example: 'anon_8dc08f5b-cd5b-411f-b4e5-9b911c4e3f35' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  anonymousId?: string;

  @ApiPropertyOptional({ enum: COOKIE_CONSENT_SOURCES, default: 'public_site' })
  @IsOptional()
  @IsIn(COOKIE_CONSENT_SOURCES)
  source?: string;

  @ApiProperty({ default: true, description: 'Cookies necessarios nao podem ser desativados.' })
  @IsBoolean()
  necessary!: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  preferences?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  analytics?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  marketing?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  acceptedAll?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  rejectedAll?: boolean;
}
