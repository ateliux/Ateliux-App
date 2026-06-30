import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/utils/request-user';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@ApiTags('Auth Admin')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.loginAdmin(dto);
    this.cookies.setAuthCookies(response, 'admin', result.tokens);
    return { user: result.user, admin: result.admin };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.cookies.getRefreshToken(request, 'admin');
    this.cookies.clearAuthCookies(response, 'admin');
    return this.auth.logoutByRefreshToken(refreshToken);
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.cookies.getRefreshToken(request, 'admin');
    const result = await this.auth.refreshAdmin(refreshToken);
    this.cookies.setAuthCookies(response, 'admin', result.tokens);
    return { user: result.user, admin: result.admin };
  }

  @ApiCookieAuth()
  @UseGuards(AdminAuthGuard)
  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user);
  }
}
