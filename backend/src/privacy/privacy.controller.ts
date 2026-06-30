import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import type { Request } from 'express';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IdParamDto } from '../common/dto/id-param.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { CreateCookieConsentDto } from './dto/create-cookie-consent.dto';
import { CreatePrivacyRequestDto } from './dto/create-privacy-request.dto';
import { PrivacyAdminQueryDto } from './dto/privacy-admin-query.dto';
import { UpdatePrivacyRequestDto } from './dto/update-privacy-request.dto';
import { PrivacyService } from './privacy.service';

@ApiTags('Privacy')
@Controller()
export class PrivacyController {
  constructor(private readonly privacy: PrivacyService) {}

  @Get('privacy/cookie-consent/config')
  getCookieConsentConfig() {
    return this.privacy.getCookieConsentConfig();
  }

  @Post('privacy/cookie-consent')
  saveCookieConsent(@Body() dto: CreateCookieConsentDto, @Req() request: Request) {
    return this.privacy.saveCookieConsent(dto, request);
  }

  @Get('privacy/cookie-consent/current')
  getCurrentCookieConsent(@Req() request: Request, @Query('anonymousId') anonymousId?: string) {
    return this.privacy.getCurrentCookieConsent(request, anonymousId);
  }

  @Post('privacy/requests')
  createPrivacyRequest(@Body() dto: CreatePrivacyRequestDto, @Req() request: Request) {
    return this.privacy.createPrivacyRequest(dto, request);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN)
  @Get('admin/privacy/consents')
  findConsents(@Query() query: PrivacyAdminQueryDto) {
    return this.privacy.findConsents(query);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT)
  @Get('admin/privacy/requests')
  findPrivacyRequests(@Query() query: PrivacyAdminQueryDto) {
    return this.privacy.findPrivacyRequests(query);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT)
  @Get('admin/privacy/requests/:id')
  findPrivacyRequest(@Param() params: IdParamDto) {
    return this.privacy.findPrivacyRequest(params.id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPPORT)
  @Patch('admin/privacy/requests/:id')
  updatePrivacyRequest(
    @Param() params: IdParamDto,
    @Body() dto: UpdatePrivacyRequestDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.privacy.updatePrivacyRequest(params.id, dto, user);
  }
}
