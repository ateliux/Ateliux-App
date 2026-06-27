import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContactLeadsService } from './contact-leads.service';
import { CreateContactLeadDto } from './dto/create-contact-lead.dto';
import { UpdateContactLeadDto } from './dto/update-contact-lead.dto';

@ApiTags('Contact')
@Controller()
export class ContactLeadsController {
  constructor(private readonly contactLeads: ContactLeadsService) {}

  @Post('contact')
  create(@Body() dto: CreateContactLeadDto) {
    return this.contactLeads.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.ATTENDANCE)
  @Get('admin/contact-leads')
  findAll() {
    return this.contactLeads.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.ATTENDANCE)
  @Get('admin/contact-leads/:id')
  findOne(@Param() params: IdParamDto) {
    return this.contactLeads.findOne(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.ATTENDANCE)
  @Patch('admin/contact-leads/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateContactLeadDto) {
    return this.contactLeads.update(params.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.ATTENDANCE)
  @Post('admin/contact-leads/:id/convert-to-client')
  convertToClient(@Param() params: IdParamDto) {
    return this.contactLeads.convertToClient(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.ATTENDANCE)
  @Post('admin/contact-leads/:id/reply')
  reply(@Param() params: IdParamDto) {
    return this.contactLeads.reply(params.id);
  }
}
