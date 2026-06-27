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
import { CreateProjectStageDto } from './dto/create-project-stage.dto';
import { UpdateProjectStageDto } from './dto/update-project-stage.dto';
import { ProjectStagesService } from './project-stages.service';

@ApiTags('Portal')
@ApiBearerAuth()
@Controller()
export class ProjectStagesController {
  constructor(private readonly stages: ProjectStagesService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/projects/:id/stages')
  findClientByProject(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.stages.findClientByProject(user, params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Get('admin/stages')
  findAdminAll() {
    return this.stages.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Post('admin/stages')
  create(@Body() dto: CreateProjectStageDto) {
    return this.stages.create(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Patch('admin/stages/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateProjectStageDto) {
    return this.stages.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Post('admin/stages/:id/send-to-client')
  sendToClient(@Param() params: IdParamDto) {
    return this.stages.sendToClient(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV)
  @Post('admin/stages/:id/request-approval')
  requestApproval(@Param() params: IdParamDto) {
    return this.stages.requestApproval(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Delete('admin/stages/:id')
  remove(@Param() params: IdParamDto) {
    return this.stages.remove(params.id);
  }
}
