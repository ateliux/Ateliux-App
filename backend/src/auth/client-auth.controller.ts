import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AUTH_COOKIE_NAMES } from '../common/constants/cookies';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/utils/request-user';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { ClientAuthGuard } from './guards/client-auth.guard';

@ApiTags('Auth Client')
@Controller('auth/client')
export class ClientAuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterClientDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.registerClient(dto);
    this.setCookies(response, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.refreshExpiresAt);
    return { user: result.user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.loginClient(dto);
    this.setCookies(response, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.refreshExpiresAt);
    return { user: result.user, client: result.client };
  }

  @ApiCookieAuth()
  @UseGuards(ClientAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: RequestUser, @Res({ passthrough: true }) response: Response) {
    this.clearCookies(response);
    return this.auth.logout(user);
  }

  @ApiCookieAuth()
  @UseGuards(ClientAuthGuard)
  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user);
  }

  private setCookies(response: Response, accessToken: string, refreshToken: string, refreshExpiresAt: Date) {
    const secure = this.config.getOrThrow<boolean>('auth.cookieSecure');
    const sameSite = this.config.getOrThrow<'lax' | 'strict' | 'none'>('auth.cookieSameSite');
    const domain = this.config.getOrThrow<string>('auth.cookieDomain');

    response.cookie(AUTH_COOKIE_NAMES.access, accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    response.cookie(AUTH_COOKIE_NAMES.refresh, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      expires: refreshExpiresAt,
      path: '/',
    });
  }

  private clearCookies(response: Response) {
    response.clearCookie(AUTH_COOKIE_NAMES.access, { path: '/' });
    response.clearCookie(AUTH_COOKIE_NAMES.refresh, { path: '/' });
  }
}
