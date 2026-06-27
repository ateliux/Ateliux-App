import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateManualHistoryNoteDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MinLength(3)
  description!: string;
}
