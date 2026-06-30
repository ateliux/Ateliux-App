import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { type AdminRole, Prisma, type UserRole } from '@prisma/client';
import type { Request } from 'express';
import { AUTH_COOKIE_NAMES } from '../common/constants/cookies';
import type { RequestUser } from '../common/utils/request-user';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCookieConsentDto } from './dto/create-cookie-consent.dto';
import type { CreatePrivacyRequestDto } from './dto/create-privacy-request.dto';
import type { PrivacyAdminQueryDto } from './dto/privacy-admin-query.dto';
import type { UpdatePrivacyRequestDto } from './dto/update-privacy-request.dto';
import { COOKIE_CONSENT_VERSION } from './privacy.constants';

type AccessJwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  adminRole?: AdminRole;
  adminUserId?: string;
  clientId?: string;
};

@Injectable()
export class PrivacyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  getCookieConsentConfig() {
    return {
      version: COOKIE_CONSENT_VERSION,
      categories: [
        {
          key: 'necessary',
          required: true,
          title: 'Necessarios',
          description:
            'Mantem login, seguranca, preferencias essenciais e funcionamento basico do site.',
        },
        {
          key: 'preferences',
          required: false,
          title: 'Preferencias',
          description: 'Guarda escolhas de exibicao e pequenas personalizacoes de experiencia.',
        },
        {
          key: 'analytics',
          required: false,
          title: 'Analiticos',
          description: 'Ajuda a entender uso agregado das paginas sem liberar dados sensiveis.',
        },
        {
          key: 'marketing',
          required: false,
          title: 'Marketing',
          description:
            'Permite mensurar campanhas e melhorar comunicacoes comerciais quando configurado.',
        },
      ],
      links: {
        privacyPolicy: '/politica-de-privacidade',
        cookiePolicy: '/politica-de-cookies',
        lgpd: '/lgpd',
      },
    };
  }

  async saveCookieConsent(dto: CreateCookieConsentDto, request: Request) {
    if (dto.necessary === false) {
      throw new BadRequestException('Cookies necessarios nao podem ser desativados.');
    }

    const user = await this.resolveOptionalUser(request);
    const acceptedAll = Boolean(dto.acceptedAll);
    const rejectedAll = Boolean(dto.rejectedAll);

    return this.prisma.cookieConsent.create({
      data: {
        userId: user?.id,
        anonymousId: dto.anonymousId,
        email: user?.email,
        ipAddress: this.getIpAddress(request),
        userAgent: this.getUserAgent(request),
        source: dto.source ?? 'public_site',
        consentVersion: COOKIE_CONSENT_VERSION,
        necessary: true,
        preferences: acceptedAll ? true : Boolean(dto.preferences),
        analytics: acceptedAll ? true : Boolean(dto.analytics),
        marketing: acceptedAll ? true : Boolean(dto.marketing),
        acceptedAll,
        rejectedAll,
      },
    });
  }

  async getCurrentCookieConsent(request: Request, anonymousId?: string) {
    const user = await this.resolveOptionalUser(request);
    const where = user?.id
      ? { userId: user.id }
      : anonymousId
        ? { anonymousId }
        : undefined;

    if (!where) return null;

    return this.prisma.cookieConsent.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPrivacyRequest(dto: CreatePrivacyRequestDto, request: Request) {
    const privacyRequest = await this.prisma.privacyRequest.create({
      data: {
        name: dto.name,
        email: dto.email,
        type: dto.type,
        message: dto.message,
        ipAddress: this.getIpAddress(request),
        userAgent: this.getUserAgent(request),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorType: 'public',
        action: 'PRIVACY_REQUEST_CREATED',
        entityType: 'PrivacyRequest',
        entityId: privacyRequest.id,
        ipAddress: this.getIpAddress(request),
        userAgent: this.getUserAgent(request),
        metadata: {
          email: dto.email,
          type: dto.type,
          legalReviewRequired: true,
        },
      },
    });

    return privacyRequest;
  }

  findConsents(query: PrivacyAdminQueryDto) {
    const where: Prisma.CookieConsentWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.anonymousId) where.anonymousId = query.anonymousId;
    if (query.email) where.email = { contains: query.email, mode: 'insensitive' };
    if (query.source) where.source = query.source;
    if (query.from || query.to) {
      where.createdAt = this.dateRange(query);
    }

    return this.prisma.cookieConsent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  findPrivacyRequests(query: PrivacyAdminQueryDto) {
    const where: Prisma.PrivacyRequestWhereInput = {};
    if (query.email) where.email = { contains: query.email, mode: 'insensitive' };
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.createdAt = this.dateRange(query);
    }

    return this.prisma.privacyRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async findPrivacyRequest(id: string) {
    const privacyRequest = await this.prisma.privacyRequest.findUnique({ where: { id } });
    if (!privacyRequest) {
      throw new NotFoundException('Solicitacao LGPD nao encontrada.');
    }
    return privacyRequest;
  }

  async updatePrivacyRequest(id: string, dto: UpdatePrivacyRequestDto, actor: RequestUser) {
    await this.findPrivacyRequest(id);
    const privacyRequest = await this.prisma.privacyRequest.update({
      where: { id },
      data: {
        status: dto.status,
        internalNote: dto.internalNote,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminUserId ?? actor.id,
        actorType: 'admin',
        action: 'PRIVACY_REQUEST_UPDATED',
        entityType: 'PrivacyRequest',
        entityId: id,
        metadata: {
          status: dto.status,
          legalReviewRequired: true,
        },
      },
    });

    return privacyRequest;
  }

  private dateRange(query: Pick<PrivacyAdminQueryDto, 'from' | 'to'>): Prisma.DateTimeFilter {
    const range: Prisma.DateTimeFilter = {};
    if (query.from) range.gte = new Date(query.from);
    if (query.to) range.lte = new Date(query.to);
    return range;
  }

  private getIpAddress(request: Request) {
    const forwardedFor = request.get('x-forwarded-for')?.split(',')[0]?.trim();
    return forwardedFor || request.ip || request.socket.remoteAddress;
  }

  private getUserAgent(request: Request) {
    return request.get('user-agent');
  }

  private async resolveOptionalUser(request: Request): Promise<RequestUser | null> {
    const token = this.extractAccessToken(request);
    if (!token) return null;

    try {
      const payload = await this.jwt.verifyAsync<AccessJwtPayload>(token, {
        secret: this.config.getOrThrow<string>('auth.jwtAccessSecret'),
      });

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        adminRole: payload.adminRole,
        adminUserId: payload.adminUserId,
        clientId: payload.clientId,
      };
    } catch {
      return null;
    }
  }

  private extractAccessToken(request: Request) {
    const bearer = request.get('authorization');
    if (bearer?.startsWith('Bearer ')) {
      return bearer.slice('Bearer '.length);
    }

    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    if (!cookies) return null;

    const requestedScope = request.get('x-ateliux-auth-scope');
    if (requestedScope === 'admin') {
      return cookies[AUTH_COOKIE_NAMES.admin.access] ?? cookies[AUTH_COOKIE_NAMES.legacy.access] ?? null;
    }
    if (requestedScope === 'client') {
      return cookies[AUTH_COOKIE_NAMES.client.access] ?? cookies[AUTH_COOKIE_NAMES.legacy.access] ?? null;
    }

    return (
      cookies[AUTH_COOKIE_NAMES.client.access] ??
      cookies[AUTH_COOKIE_NAMES.admin.access] ??
      cookies[AUTH_COOKIE_NAMES.legacy.access] ??
      null
    );
  }
}
