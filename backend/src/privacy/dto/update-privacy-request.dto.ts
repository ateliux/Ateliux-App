import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PRIVACY_REQUEST_STATUSES } from '../privacy.constants';

export class UpdatePrivacyRequestDto {
  @ApiPropertyOptional({ enum: PRIVACY_REQUEST_STATUSES })
  @IsOptional()
  @IsIn(PRIVACY_REQUEST_STATUSES)
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNote?: string;
}
