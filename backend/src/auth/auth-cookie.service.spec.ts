/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthCookieService } from './auth-cookie.service';
import { AUTH_COOKIE_NAMES } from '../common/constants/cookies';

function createConfig(values: Record<string, unknown>) {
  return {
    get<T = unknown>(key: string) {
      return values[key] as T;
    },
    getOrThrow<T = unknown>(key: string) {
      if (!(key in values)) throw new Error(`Missing config: ${key}`);
      return values[key] as T;
    },
  };
}

describe('AuthCookieService', () => {
  it('usa maxAge da config e omite domain=localhost em cookies locais', () => {
    const service = new AuthCookieService(
      createConfig({
        'auth.jwtAccessExpiresIn': '30s',
        'auth.cookieSecure': false,
        'auth.cookieSameSite': 'lax',
        'auth.cookieDomain': 'localhost',
        'auth.authDebug': false,
      }) as never,
    );
    const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const cleared: Array<{ name: string; options: Record<string, unknown> }> = [];
    const response = {
      cookie(name: string, value: string, options: Record<string, unknown>) {
        cookies.push({ name, value, options });
      },
      clearCookie(name: string, options: Record<string, unknown>) {
        cleared.push({ name, options });
      },
    };

    service.setAuthCookies(response as never, 'admin', {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshExpiresAt: new Date('2026-07-01T00:00:00.000Z'),
    });

    const access = cookies.find((cookie) => cookie.name === AUTH_COOKIE_NAMES.admin.access);
    const refresh = cookies.find((cookie) => cookie.name === AUTH_COOKIE_NAMES.admin.refresh);

    assert.equal(access?.options.maxAge, 30_000);
    assert.equal(access?.options.httpOnly, true);
    assert.equal(access?.options.secure, false);
    assert.equal(access?.options.sameSite, 'lax');
    assert.equal('domain' in (access?.options ?? {}), false);
    assert.equal(refresh?.options.expires instanceof Date, true);
    assert.ok(cleared.some((cookie) => cookie.name === AUTH_COOKIE_NAMES.legacy.access));
    assert.ok(cleared.some((cookie) => cookie.name === AUTH_COOKIE_NAMES.legacy.refresh));
    assert.ok(
      cleared.some(
        (cookie) =>
          cookie.name === AUTH_COOKIE_NAMES.legacy.access && cookie.options.domain === 'localhost',
      ),
    );
  });

  it('limpa cookies com domain configurado e tambem host-only', () => {
    const service = new AuthCookieService(
      createConfig({
        'auth.jwtAccessExpiresIn': '15m',
        'auth.cookieSecure': true,
        'auth.cookieSameSite': 'none',
        'auth.cookieDomain': '.ateliux.com.br',
        'auth.authDebug': false,
      }) as never,
    );
    const cleared: Array<{ name: string; options: Record<string, unknown> }> = [];
    const response = {
      cookie() {
        return undefined;
      },
      clearCookie(name: string, options: Record<string, unknown>) {
        cleared.push({ name, options });
      },
    };

    service.clearAuthCookies(response as never, 'client');

    const accessClears = cleared.filter((cookie) => cookie.name === AUTH_COOKIE_NAMES.client.access);
    assert.ok(accessClears.some((cookie) => !('domain' in cookie.options)));
    assert.ok(accessClears.some((cookie) => cookie.options.domain === '.ateliux.com.br'));
  });
});
