import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { AuditLogsService } from './audit-logs.service';
import { CreateManualHistoryNoteDto } from './dto/create-manual-history-note.dto';

@ApiTags('History')
@ApiBearerAuth()
@Controller()
export class HistoryController {
  constructor(private readonly auditLogs: AuditLogsService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/history')
  findClientHistory(@CurrentUser() user: RequestUser) {
    return this.auditLogs.findClientHistory(user);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT)
  @Get('admin/history')
  findAdminHistory() {
    return this.auditLogs.findAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT)
  @Post('admin/history/manual-note')
  createManualNote(@CurrentUser() user: RequestUser, @Body() dto: CreateManualHistoryNoteDto) {
    return this.auditLogs.createManualNote(user, dto);
  }
}
