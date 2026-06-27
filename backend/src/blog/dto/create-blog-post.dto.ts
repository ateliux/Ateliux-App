import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogPostStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBlogPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverFileId?: string;

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
}
