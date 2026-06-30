import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { AdminRole, UserRole } from '@prisma/client';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_COOKIE_NAMES } from '../../common/constants/cookies';
import type { RequestUser } from '../../common/utils/request-user';

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  adminRole?: AdminRole;
  adminUserId?: string;
  clientId?: string;
};

function extractJwtFromCookie(request: Request): string | null {
  const cookies = request.cookies as Record<string, string | undefined> | undefined;
  if (!cookies) return null;

  const requestedScope = request.get('x-ateliux-auth-scope');
  if (requestedScope === 'admin') {
    return cookies[AUTH_COOKIE_NAMES.admin.access] ?? cookies[AUTH_COOKIE_NAMES.legacy.access] ?? null;
  }
  if (requestedScope === 'client') {
    return cookies[AUTH_COOKIE_NAMES.client.access] ?? cookies[AUTH_COOKIE_NAMES.legacy.access] ?? null;
  }

  const path = request.originalUrl ?? request.url ?? '';
  if (path.includes('/auth/admin') || path.includes('/admin/')) {
    return cookies[AUTH_COOKIE_NAMES.admin.access] ?? cookies[AUTH_COOKIE_NAMES.legacy.access] ?? null;
  }

  if (path.includes('/auth/client') || path.includes('/client/')) {
    return cookies[AUTH_COOKIE_NAMES.client.access] ?? cookies[AUTH_COOKIE_NAMES.legacy.access] ?? null;
  }

  return (
    cookies[AUTH_COOKIE_NAMES.admin.access] ??
    cookies[AUTH_COOKIE_NAMES.client.access] ??
    cookies[AUTH_COOKIE_NAMES.legacy.access] ??
    null
  );
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromCookie,
      ]),
      secretOrKey: config.getOrThrow<string>('auth.jwtAccessSecret'),
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      adminRole: payload.adminRole,
      adminUserId: payload.adminUserId,
      clientId: payload.clientId,
    };
  }
}
