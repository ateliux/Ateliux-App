import { PartialType } from '@nestjs/swagger';
import { CreateFinanceRecordDto } from './create-finance-record.dto';

export class UpdateFinanceRecordDto extends PartialType(CreateFinanceRecordDto) {}
