import { PartialType } from '@nestjs/swagger';
import { AdminCreateClientRequestDto } from './admin-create-client-request.dto';

export class UpdateClientRequestDto extends PartialType(AdminCreateClientRequestDto) {}
