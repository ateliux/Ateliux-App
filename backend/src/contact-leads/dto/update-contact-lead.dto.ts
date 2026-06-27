import { PartialType } from '@nestjs/swagger';
import { CreateContactLeadDto } from './create-contact-lead.dto';

export class UpdateContactLeadDto extends PartialType(CreateContactLeadDto) {}
