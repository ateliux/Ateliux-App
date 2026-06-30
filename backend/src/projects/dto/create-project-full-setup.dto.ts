import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  BriefingStatus,
  FinanceStatus,
  Priority,
  ProjectStatus,
  StageStatus,
  VisibilityStatus,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitialBriefingSetupDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  description!: string;

  @ApiPropertyOptional({ enum: VisibilityStatus, default: VisibilityStatus.VISIBLE_TO_CLIENT })
  @IsOptional()
  @IsEnum(VisibilityStatus)
  visibility?: VisibilityStatus;

  @ApiPropertyOptional({ enum: BriefingStatus, default: BriefingStatus.SENT })
  @IsOptional()
  @IsEnum(BriefingStatus)
  status?: BriefingStatus;
}

export class InitialProjectStageSetupDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ enum: StageStatus, default: StageStatus.SENT_TO_CLIENT })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  visibleToClient?: boolean;
}

export class InitialScheduleEventSetupDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsible?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  visibleToClient?: boolean;
}

export class InitialFinanceSetupDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty()
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  installment?: string;

  @ApiPropertyOptional({ enum: FinanceStatus, default: FinanceStatus.PENDING })
  @IsOptional()
  @IsEnum(FinanceStatus)
  status?: FinanceStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  visibleToClient?: boolean;
}

export class CreateProjectFullSetupDto {
  @ApiProperty()
  @IsString()
  clientId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  type!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  scope!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  description!: string;

  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;

  @ApiProperty({ enum: Priority })
  @IsEnum(Priority)
  priority!: Priority;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  managerId!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  teamIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty()
  @IsDateString()
  deadline!: string;

  @ApiProperty()
  @IsBoolean()
  visibleToClient!: boolean;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  currentStage!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(100)
  progress!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientFacingSummary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ type: InitialBriefingSetupDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InitialBriefingSetupDto)
  initialBriefing?: InitialBriefingSetupDto;

  @ApiPropertyOptional({ type: [InitialProjectStageSetupDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => InitialProjectStageSetupDto)
  initialStages?: InitialProjectStageSetupDto[];

  @ApiPropertyOptional({ type: [InitialScheduleEventSetupDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => InitialScheduleEventSetupDto)
  initialScheduleEvents?: InitialScheduleEventSetupDto[];

  @ApiPropertyOptional({ type: InitialFinanceSetupDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InitialFinanceSetupDto)
  initialFinance?: InitialFinanceSetupDto;
}
