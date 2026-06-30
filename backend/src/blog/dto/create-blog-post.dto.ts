import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogPostStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  heroImageFileId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(260)
  excerpt?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  content!: string;

  @ApiPropertyOptional({ enum: BlogPostStatus })
  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insightTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insightDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insightCtaLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insightCtaHref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contextTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contextContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  practicalTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  practicalContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledAt?: string;
}
