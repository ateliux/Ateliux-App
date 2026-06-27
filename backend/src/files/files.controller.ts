import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { CreateFileAssetDto } from './dto/create-file-asset.dto';
import { RejectFileDto } from './dto/reject-file.dto';
import { UpdateFileAssetDto } from './dto/update-file-asset.dto';
import { FilesService } from './files.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller()
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/files')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.files.findClientAll(user);
  }

  @UseGuards(ClientAuthGuard)
  @Post('client/files')
  createClient(@CurrentUser() user: RequestUser, @Body() dto: CreateFileAssetDto) {
    return this.files.create(user, { ...dto, clientId: user.clientId });
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT, AdminRole.DESIGNER_DEV)
  @Get('admin/files')
  findAdminAll() {
    return this.files.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT, AdminRole.DESIGNER_DEV)
  @Get('admin/files/pending-review')
  pendingReview() {
    return this.files.pendingReview();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT, AdminRole.DESIGNER_DEV)
  @Post('admin/files')
  createAdmin(@CurrentUser() user: RequestUser, @Body() dto: CreateFileAssetDto) {
    return this.files.create(user, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT, AdminRole.DESIGNER_DEV)
  @Patch('admin/files/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateFileAssetDto) {
    return this.files.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT, AdminRole.DESIGNER_DEV)
  @Post('admin/files/:id/approve')
  approve(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.files.approve(params.id, user);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT, AdminRole.DESIGNER_DEV)
  @Post('admin/files/:id/reject')
  reject(@CurrentUser() user: RequestUser, @Param() params: IdParamDto, @Body() dto: RejectFileDto) {
    return this.files.reject(params.id, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('files/:id/signed-url')
  signedUrl(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.files.signedUrl(params.id, user);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT, AdminRole.DESIGNER_DEV)
  @Delete('admin/files/:id')
  remove(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.files.remove(params.id, user);
  }
}
