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
import { CreateFinanceRecordDto } from './dto/create-finance-record.dto';
import { UpdateFinanceRecordDto } from './dto/update-finance-record.dto';
import { FinanceService } from './finance.service';

@ApiTags('Portal')
@ApiBearerAuth()
@Controller()
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/finance')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.finance.findClientAll(user);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.FINANCE)
  @Get('admin/finance')
  findAdminAll() {
    return this.finance.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.FINANCE)
  @Post('admin/finance')
  create(@Body() dto: CreateFinanceRecordDto) {
    return this.finance.create(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.FINANCE)
  @Patch('admin/finance/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateFinanceRecordDto) {
    return this.finance.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.FINANCE)
  @Delete('admin/finance/:id')
  remove(@Param() params: IdParamDto) {
    return this.finance.remove(params.id);
  }
}
