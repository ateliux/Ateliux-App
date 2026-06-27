import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN)
@Controller('admin/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogs: AuditLogsService) {}

  @Get()
  findAll() {
    return this.auditLogs.findAll();
  }

  @Get(':id')
  findOne(@Param() params: IdParamDto) {
    return this.auditLogs.findOne(params.id);
  }
}
