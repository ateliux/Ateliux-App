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
import { BriefingResponseDto } from './dto/briefing-response.dto';
import { CreateBriefingDto } from './dto/create-briefing.dto';
import { UpdateBriefingDto } from './dto/update-briefing.dto';
import { BriefingsService } from './briefings.service';

@ApiTags('Portal')
@ApiBearerAuth()
@Controller()
export class BriefingsController {
  constructor(private readonly briefings: BriefingsService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/briefings')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.briefings.findClientAll(user);
  }

  @UseGuards(ClientAuthGuard)
  @Get('client/briefings/:id')
  findClientOne(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.briefings.findClientOne(user, params.id);
  }

  @UseGuards(ClientAuthGuard)
  @Post('client/briefings/:id/response')
  respond(@CurrentUser() user: RequestUser, @Param() params: IdParamDto, @Body() dto: BriefingResponseDto) {
    return this.briefings.respond(user, params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Get('admin/briefings')
  findAdminAll() {
    return this.briefings.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Post('admin/briefings')
  create(@Body() dto: CreateBriefingDto) {
    return this.briefings.create(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Patch('admin/briefings/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateBriefingDto) {
    return this.briefings.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Post('admin/briefings/:id/send')
  send(@Param() params: IdParamDto) {
    return this.briefings.send(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Delete('admin/briefings/:id')
  remove(@Param() params: IdParamDto) {
    return this.briefings.remove(params.id);
  }
}
