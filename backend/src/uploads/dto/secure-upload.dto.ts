import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SecureUploadDto {
  @ApiProperty({
    enum: [
      'avatar',
      'blog_cover',
      'blog_hero',
      'contact_attachment',
      'support_attachment',
      'client_file',
      'approval_attachment',
      'briefing_attachment',
      'finance_receipt',
      'preview_asset',
    ],
  })
  @IsString()
  context!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;
}
