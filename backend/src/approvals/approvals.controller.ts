import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { RequestChangesDto } from './dto/request-changes.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';

@ApiTags('Portal')
@ApiBearerAuth()
@Controller()
export class ApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/approvals')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.approvals.findClientAll(user);
  }

  @UseGuards(ClientAuthGuard)
  @Post('client/approvals/:id/approve')
  approve(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.approvals.approve(user, params.id);
  }

  @UseGuards(ClientAuthGuard)
  @Post('client/approvals/:id/request-changes')
  requestChanges(@CurrentUser() user: RequestUser, @Param() params: IdParamDto, @Body() dto: RequestChangesDto) {
    return this.approvals.requestChanges(user, params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Get('admin/approvals')
  findAdminAll() {
    return this.approvals.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Post('admin/approvals')
  create(@Body() dto: CreateApprovalDto) {
    return this.approvals.create(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Patch('admin/approvals/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateApprovalDto) {
    return this.approvals.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Post('admin/approvals/:id/send')
  send(@Param() params: IdParamDto) {
    return this.approvals.send(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Delete('admin/approvals/:id')
  remove(@Param() params: IdParamDto) {
    return this.approvals.remove(params.id);
  }
}
