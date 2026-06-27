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
import { CreateScheduleEventDto } from './dto/create-schedule-event.dto';
import { UpdateScheduleEventDto } from './dto/update-schedule-event.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('Portal')
@ApiBearerAuth()
@Controller()
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/schedule')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.schedule.findClientAll(user);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Get('admin/schedule')
  findAdminAll() {
    return this.schedule.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Post('admin/schedule')
  create(@Body() dto: CreateScheduleEventDto) {
    return this.schedule.create(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Patch('admin/schedule/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateScheduleEventDto) {
    return this.schedule.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Delete('admin/schedule/:id')
  remove(@Param() params: IdParamDto) {
    return this.schedule.remove(params.id);
  }
}
