/* eslint-disable @typescript-eslint/no-floating-promises */
import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AdminRole, UserRole } from '@prisma/client';
import type { Request } from 'express';
import { AUTH_COOKIE_NAMES } from '../common/constants/cookies';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { PrivacyService } from './privacy.service';

function createConfig() {
  return {
    getOrThrow<T = unknown>(key: string) {
      if (key !== 'auth.jwtAccessSecret') throw new Error(`Missing config: ${key}`);
      return 'access-secret-ateliux-test' as T;
    },
  };
}

function createRequest(input: {
  token?: string;
  anonymousId?: string;
  userAgent?: string;
  ip?: string;
} = {}) {
  const cookies: Record<string, string | undefined> = {};
  if (input.token) cookies[AUTH_COOKIE_NAMES.client.access] = input.token;

  return {
    cookies,
    ip: input.ip ?? '127.0.0.1',
    socket: { remoteAddress: input.ip ?? '127.0.0.1' },
    get(name: string) {
      const normalized = name.toLowerCase();
      if (normalized === 'user-agent') return input.userAgent ?? 'node-test';
      if (normalized === 'authorization') return undefined;
      if (normalized === 'x-ateliux-auth-scope') return 'client';
      if (normalized === 'x-forwarded-for') return input.ip;
      return undefined;
    },
  } as unknown as Request;
}

function createService() {
  const consents: Array<Record<string, unknown>> = [];
  const privacyRequests: Array<Record<string, unknown>> = [];
  const auditLogs: Array<Record<string, unknown>> = [];

  const prisma = {
    cookieConsent: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = {
          id: `consent-${consents.length + 1}`,
          createdAt: new Date(Date.now() + consents.length),
          ...data,
        };
        consents.push(row);
        return row;
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) =>
        [...consents]
          .reverse()
          .find((row) =>
            Object.entries(where).every(([key, value]) => row[key] === value),
          ) ?? null,
      findMany: async ({ where }: { where: Record<string, unknown> }) =>
        consents.filter((row) =>
          Object.entries(where).every(([key, value]) => {
            if (typeof value === 'object' && value && 'contains' in value) {
              return String(row[key]).includes(String(value.contains));
            }
            return row[key] === value;
          }),
        ),
    },
    privacyRequest: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: `privacy-${privacyRequests.length + 1}`, status: 'OPEN', ...data };
        privacyRequests.push(row);
        return row;
      },
      findMany: async ({ where }: { where: Record<string, unknown> }) =>
        privacyRequests.filter((row) =>
          Object.entries(where).every(([key, value]) => row[key] === value),
        ),
      findUnique: async ({ where }: { where: { id: string } }) =>
        privacyRequests.find((row) => row.id === where.id) ?? null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = privacyRequests.find((item) => item.id === where.id);
        if (!row) throw new Error('Privacy request not found.');
        Object.assign(row, data);
        return row;
      },
    },
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        auditLogs.push(data);
        return data;
      },
    },
  };

  return {
    service: new PrivacyService(prisma as never, new JwtService(), createConfig() as never),
    consents,
    privacyRequests,
    auditLogs,
  };
}

describe('PrivacyService', () => {
  it('salva consentimento anonimo com cookies necessarios sempre ativos', async () => {
    const { service, consents } = createService();

    const result = await service.saveCookieConsent(
      {
        anonymousId: 'anon-1',
        source: 'public_site',
        necessary: true,
        analytics: true,
      },
      createRequest(),
    );

    assert.equal(result.id, 'consent-1');
    assert.equal(consents[0].anonymousId, 'anon-1');
    assert.equal(consents[0].necessary, true);
    assert.equal(consents[0].analytics, true);
    assert.equal(consents[0].marketing, false);
  });

  it('salva consentimento vinculado ao usuario logado quando houver cookie valido', async () => {
    const { service, consents } = createService();
    const jwt = new JwtService();
    const token = await jwt.signAsync(
      {
        sub: 'user-client',
        email: 'cliente@ateliux.test',
        role: UserRole.CLIENT,
        clientId: 'client-1',
      },
      { secret: 'access-secret-ateliux-test' },
    );

    await service.saveCookieConsent(
      {
        anonymousId: 'anon-2',
        source: 'client_portal',
        necessary: true,
        acceptedAll: true,
      },
      createRequest({ token }),
    );

    assert.equal(consents[0].userId, 'user-client');
    assert.equal(consents[0].email, 'cliente@ateliux.test');
    assert.equal(consents[0].preferences, true);
    assert.equal(consents[0].analytics, true);
    assert.equal(consents[0].marketing, true);
  });

  it('bloqueia tentativa de desativar cookies necessarios', async () => {
    const { service } = createService();

    await assert.rejects(
      () =>
        service.saveCookieConsent(
          {
            anonymousId: 'anon-3',
            source: 'public_site',
            necessary: false,
          },
          createRequest(),
        ),
      /Cookies necessarios nao podem ser desativados/,
    );
  });

  it('cria solicitacao LGPD publica e registra auditoria', async () => {
    const { service, privacyRequests, auditLogs } = createService();

    const result = await service.createPrivacyRequest(
      {
        name: 'Cliente LGPD',
        email: 'lgpd@ateliux.test',
        type: 'ACCESS',
        message: 'Quero acessar meus dados.',
      },
      createRequest(),
    );

    assert.equal(result.id, 'privacy-1');
    assert.equal(privacyRequests[0].status, 'OPEN');
    assert.equal(auditLogs[0].action, 'PRIVACY_REQUEST_CREATED');
  });

  it('filtra consentimentos e atualiza solicitacao LGPD pela admin', async () => {
    const { service, privacyRequests, auditLogs } = createService();
    await service.saveCookieConsent(
      {
        anonymousId: 'anon-4',
        source: 'public_site',
        necessary: true,
      },
      createRequest(),
    );
    await service.createPrivacyRequest(
      { name: 'Cliente LGPD', email: 'lgpd@ateliux.test', type: 'DELETION' },
      createRequest(),
    );

    const consents = await service.findConsents({ anonymousId: 'anon-4' });
    assert.equal(consents.length, 1);

    const actor: RequestUser = {
      id: 'admin-user',
      email: 'admin@ateliux.test',
      role: UserRole.ADMIN,
      adminRole: AdminRole.ADMIN,
      adminUserId: 'admin-1',
    };
    const updated = await service.updatePrivacyRequest('privacy-1', { status: 'IN_REVIEW' }, actor);

    assert.equal(updated.status, 'IN_REVIEW');
    assert.equal(privacyRequests[0].status, 'IN_REVIEW');
    assert.equal(auditLogs.at(-1)?.action, 'PRIVACY_REQUEST_UPDATED');
  });
});

describe('Privacy admin authorization', () => {
  it('nega acesso quando o papel admin nao esta permitido', () => {
    const handler = () => undefined;
    Reflect.defineMetadata(ROLES_KEY, [AdminRole.ADMIN], handler);
    const request = {
      user: {
        id: 'editor-user',
        email: 'editor@ateliux.test',
        role: UserRole.ADMIN,
        adminRole: AdminRole.EDITOR,
        adminUserId: 'editor-1',
      },
    };
    const context = {
      getHandler: () => handler,
      getClass: () => class TestController {},
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    assert.equal(new RolesGuard(new Reflector()).canActivate(context), false);
  });
});
