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
  return cookies?.[AUTH_COOKIE_NAMES.access] ?? null;
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
