import { PartialType } from '@nestjs/swagger';
import { CreateBriefingDto } from './create-briefing.dto';

export class UpdateBriefingDto extends PartialType(CreateBriefingDto) {}
