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
import { CreatePreviewDto } from './dto/create-preview.dto';
import { UpdatePreviewDto } from './dto/update-preview.dto';
import { PreviewsService } from './previews.service';

@ApiTags('Portal')
@ApiBearerAuth()
@Controller()
export class PreviewsController {
  constructor(private readonly previews: PreviewsService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/previews')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.previews.findClientAll(user);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Get('admin/previews')
  findAdminAll() {
    return this.previews.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Post('admin/previews')
  create(@Body() dto: CreatePreviewDto) {
    return this.previews.create(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Patch('admin/previews/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdatePreviewDto) {
    return this.previews.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Post('admin/previews/:id/send-for-approval')
  sendForApproval(@Param() params: IdParamDto) {
    return this.previews.sendForApproval(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Delete('admin/previews/:id')
  remove(@Param() params: IdParamDto) {
    return this.previews.remove(params.id);
  }
}
