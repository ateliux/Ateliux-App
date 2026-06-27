import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { AdminCreateClientRequestDto } from './dto/admin-create-client-request.dto';
import { CreateClientRequestDto } from './dto/create-client-request.dto';
import { ReplyClientRequestDto } from './dto/reply-client-request.dto';
import { UpdateClientRequestDto } from './dto/update-client-request.dto';
import { ClientRequestsService } from './client-requests.service';

@ApiTags('Portal')
@ApiBearerAuth()
@Controller()
export class ClientRequestsController {
  constructor(private readonly requests: ClientRequestsService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/requests')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.requests.findClientAll(user);
  }

  @UseGuards(ClientAuthGuard)
  @Post('client/requests')
  createClient(@CurrentUser() user: RequestUser, @Body() dto: CreateClientRequestDto) {
    return this.requests.createClient(user, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT)
  @Get('admin/requests')
  findAdminAll() {
    return this.requests.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT)
  @Post('admin/requests')
  createAdmin(@Body() dto: AdminCreateClientRequestDto) {
    return this.requests.createAdmin(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT)
  @Patch('admin/requests/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateClientRequestDto) {
    return this.requests.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT)
  @Post('admin/requests/:id/reply')
  reply(@Param() params: IdParamDto, @Body() dto: ReplyClientRequestDto) {
    return this.requests.reply(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.SUPPORT)
  @Post('admin/requests/:id/convert-to-stage')
  convertToStage(@Param() params: IdParamDto) {
    return this.requests.convertToStage(params.id);
  }
}
