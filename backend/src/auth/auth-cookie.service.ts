import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import {
  AUTH_COOKIE_NAMES,
  type AuthCookieScope,
} from '../common/constants/cookies';
import { durationToMs } from './auth-time';

type AuthCookieTokens = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

@Injectable()
export class AuthCookieService {
  private readonly logger = new Logger(AuthCookieService.name);

  constructor(private readonly config: ConfigService) {}

  setAuthCookies(response: Response, scope: AuthCookieScope, tokens: AuthCookieTokens) {
    const names = AUTH_COOKIE_NAMES[scope];

    response.cookie(names.access, tokens.accessToken, {
      ...this.baseCookieOptions(),
      maxAge: this.accessMaxAgeMs(),
    });
    response.cookie(names.refresh, tokens.refreshToken, {
      ...this.baseCookieOptions(),
      expires: tokens.refreshExpiresAt,
    });

    this.clearLegacyCookies(response);
    this.debug(`${scope} login/refresh cookies set`);
  }

  clearAuthCookies(response: Response, scope: AuthCookieScope) {
    const names = AUTH_COOKIE_NAMES[scope];
    this.clearCookie(response, names.access);
    this.clearCookie(response, names.refresh);
    this.clearLegacyCookies(response);
    this.debug(`${scope} cookies cleared`);
  }

  getRefreshToken(request: Request, scope: AuthCookieScope) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return cookies?.[AUTH_COOKIE_NAMES[scope].refresh] ?? cookies?.[AUTH_COOKIE_NAMES.legacy.refresh] ?? null;
  }

  baseCookieOptions(): CookieOptions {
    const domain = this.cookieDomain();
    return {
      httpOnly: true,
      secure: this.config.getOrThrow<boolean>('auth.cookieSecure'),
      sameSite: this.config.getOrThrow<'lax' | 'strict' | 'none'>('auth.cookieSameSite'),
      ...(domain ? { domain } : {}),
      path: '/',
    };
  }

  clearCookieOptions(): CookieOptions {
    const domain = this.cookieDomain();
    return {
      secure: this.config.getOrThrow<boolean>('auth.cookieSecure'),
      sameSite: this.config.getOrThrow<'lax' | 'strict' | 'none'>('auth.cookieSameSite'),
      ...(domain ? { domain } : {}),
      path: '/',
    };
  }

  accessMaxAgeMs() {
    return durationToMs(this.config.getOrThrow<string>('auth.jwtAccessExpiresIn'), 15 * 60 * 1000);
  }

  private clearLegacyCookies(response: Response) {
    this.clearCookie(response, AUTH_COOKIE_NAMES.legacy.access);
    this.clearCookie(response, AUTH_COOKIE_NAMES.legacy.refresh);
  }

  private clearCookie(response: Response, name: string) {
    const baseOptions = this.clearCookieOptions();
    const rawDomain = this.rawCookieDomain();
    const normalizedDomain = this.cookieDomain();

    this.expireCookie(response, name, this.withoutDomain(baseOptions));

    if (normalizedDomain) {
      this.expireCookie(response, name, {
        ...baseOptions,
        domain: normalizedDomain,
      });
    }

    if (rawDomain && rawDomain !== normalizedDomain) {
      this.expireCookie(response, name, {
        ...baseOptions,
        domain: rawDomain,
      });
    }
  }

  private expireCookie(response: Response, name: string, options: CookieOptions) {
    response.clearCookie(name, options);
    response.cookie(name, '', {
      ...options,
      httpOnly: true,
      expires: new Date(0),
      maxAge: 0,
    });
  }

  private cookieDomain() {
    const domain = this.rawCookieDomain();
    if (!domain || domain === 'localhost') return undefined;
    return domain;
  }

  private rawCookieDomain() {
    return this.config.get<string>('auth.cookieDomain')?.trim() || undefined;
  }

  private withoutDomain(options: CookieOptions): CookieOptions {
    const nextOptions = { ...options };
    delete nextOptions.domain;
    return nextOptions;
  }

  private debug(message: string) {
    if (this.config.get<boolean>('auth.authDebug')) {
      this.logger.debug(message);
    }
  }
}
