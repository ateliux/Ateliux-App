import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientPipelineStatusDto } from './dto/update-client-pipeline-status.dto';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.ATTENDANCE)
@Controller('admin/clients')
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  findAll() {
    return this.clients.findAll();
  }

  @Get(':id')
  findOne(@Param() params: IdParamDto) {
    return this.clients.findOne(params.id);
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clients.create(dto);
  }

  @Patch(':id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateClientDto) {
    return this.clients.update(params.id, dto);
  }

  @Delete(':id')
  remove(@Param() params: IdParamDto) {
    return this.clients.remove(params.id);
  }

  @Post(':id/invite')
  invite(@Param() params: IdParamDto) {
    return this.clients.invite(params.id);
  }

  @Patch(':id/status')
  updateStatus(@Param() params: IdParamDto, @Body() dto: UpdateClientStatusDto) {
    return this.clients.updateStatus(params.id, dto);
  }

  @Patch(':id/pipeline-status')
  updatePipelineStatus(
    @CurrentUser() user: RequestUser,
    @Param() params: IdParamDto,
    @Body() dto: UpdateClientPipelineStatusDto,
  ) {
    return this.clients.updatePipelineStatus(params.id, dto, user);
  }
}
