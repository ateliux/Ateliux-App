import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import type { RequestUser } from '../common/utils/request-user';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @UseGuards(ClientAuthGuard)
  @Get('client/notifications')
  findClientAll(@CurrentUser() user: RequestUser) {
    return this.notifications.findClientAll(user);
  }

  @UseGuards(ClientAuthGuard)
  @Patch('client/notifications/:id/read')
  markClientRead(@Param() params: IdParamDto) {
    return this.notifications.markRead(params.id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/notifications')
  findAdminAll() {
    return this.notifications.findAdminAll();
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/notifications/:id/read')
  markAdminRead(@Param() params: IdParamDto) {
    return this.notifications.markRead(params.id);
  }
}
