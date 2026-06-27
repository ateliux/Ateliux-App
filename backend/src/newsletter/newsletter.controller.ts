import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';

@ApiTags('Newsletter')
@Controller()
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post('newsletter/subscribe')
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletter.subscribe(dto);
  }

  @Post('newsletter/unsubscribe')
  unsubscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletter.unsubscribe(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Get('admin/newsletter/subscribers')
  findAll() {
    return this.newsletter.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Patch('admin/newsletter/subscribers/:id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateSubscriberDto) {
    return this.newsletter.update(params.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Delete('admin/newsletter/subscribers/:id')
  remove(@Param() params: IdParamDto) {
    return this.newsletter.remove(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.EDITOR)
  @Get('admin/newsletter/subscribers/export')
  export() {
    return this.newsletter.export();
  }
}
