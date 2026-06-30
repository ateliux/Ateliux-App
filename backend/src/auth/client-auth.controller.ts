import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/utils/request-user';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { ClientAuthGuard } from './guards/client-auth.guard';

@ApiTags('Auth Client')
@Controller('auth/client')
export class ClientAuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterClientDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.registerClient(dto);
    this.cookies.setAuthCookies(response, 'client', result.tokens);
    return { user: result.user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.loginClient(dto);
    this.cookies.setAuthCookies(response, 'client', result.tokens);
    return { user: result.user, client: result.client };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.cookies.getRefreshToken(request, 'client');
    this.cookies.clearAuthCookies(response, 'client');
    return this.auth.logoutByRefreshToken(refreshToken);
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.cookies.getRefreshToken(request, 'client');
    const result = await this.auth.refreshClient(refreshToken);
    this.cookies.setAuthCookies(response, 'client', result.tokens);
    return { user: result.user, client: result.client };
  }

  @ApiCookieAuth()
  @UseGuards(ClientAuthGuard)
  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user);
  }
}
