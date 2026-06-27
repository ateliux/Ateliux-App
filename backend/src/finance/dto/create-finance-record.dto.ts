import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinanceStatus } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFinanceRecordDto {
  @ApiProperty()
  @IsString()
  clientId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty()
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ enum: FinanceStatus })
  @IsOptional()
  @IsEnum(FinanceStatus)
  status?: FinanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  installment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  visibleToClient?: boolean;
}
