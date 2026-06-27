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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller()
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/projects')
  findClientProjects(@CurrentUser() user: RequestUser) {
    return this.projects.findClientProjects(user);
  }

  @UseGuards(ClientAuthGuard)
  @Get('client/team')
  findClientTeam(@CurrentUser() user: RequestUser) {
    return this.projects.findClientTeam(user);
  }

  @UseGuards(ClientAuthGuard)
  @Get('client/projects/:id')
  findClientProject(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.projects.findClientProject(user, params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Get('admin/clients/:id/projects')
  findAdminByClient(@Param() params: IdParamDto) {
    return this.projects.findAdminByClient(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Get('admin/projects/:id')
  findAdminOne(@Param() params: IdParamDto) {
    return this.projects.findAdminOne(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Post('admin/projects')
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Patch('admin/projects/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateProjectDto) {
    return this.projects.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER)
  @Delete('admin/projects/:id')
  remove(@Param() params: IdParamDto) {
    return this.projects.remove(params.id);
  }
}
