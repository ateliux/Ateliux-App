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
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InboxService } from './inbox.service';

@ApiTags('Inbox')
@ApiBearerAuth()
@Controller()
export class InboxController {
  constructor(private readonly inbox: InboxService) {}

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT, AdminRole.PROJECT_MANAGER, AdminRole.ATTENDANCE)
  @Get('admin/inbox/conversations')
  findAdminAll() {
    return this.inbox.findAdminAll();
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT, AdminRole.PROJECT_MANAGER, AdminRole.ATTENDANCE)
  @Get('admin/inbox/conversations/:id')
  findAdminOne(@Param() params: IdParamDto) {
    return this.inbox.findAdminOne(params.id);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT, AdminRole.ATTENDANCE)
  @Post('admin/inbox/conversations')
  createAdmin(@Body() dto: CreateConversationDto) {
    return this.inbox.createAdmin(dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT, AdminRole.PROJECT_MANAGER, AdminRole.ATTENDANCE)
  @Post('admin/inbox/conversations/:id/messages')
  addAdminMessage(@CurrentUser() user: RequestUser, @Param() params: IdParamDto, @Body() dto: CreateMessageDto) {
    return this.inbox.addAdminMessage(params.id, user, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT, AdminRole.PROJECT_MANAGER, AdminRole.ATTENDANCE)
  @Patch('admin/inbox/conversations/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateConversationDto) {
    return this.inbox.update(params.id, dto);
  }

  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT)
  @Delete('admin/inbox/conversations/:id')
  delete(@Param() params: IdParamDto) {
    return this.inbox.delete(params.id);
  }

  @UseGuards(ClientAuthGuard)
  @Get('client/inbox/conversations')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.inbox.findClientAll(user);
  }

  @UseGuards(ClientAuthGuard)
  @Get('client/inbox/conversations/:id')
  findClientOne(@CurrentUser() user: RequestUser, @Param() params: IdParamDto) {
    return this.inbox.findClientOne(user, params.id);
  }

  @UseGuards(ClientAuthGuard)
  @Post('client/inbox/conversations/:id/messages')
  addClientMessage(@CurrentUser() user: RequestUser, @Param() params: IdParamDto, @Body() dto: CreateMessageDto) {
    return this.inbox.addClientMessage(user, params.id, dto);
  }
}
