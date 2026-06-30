/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, AdminRole, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { AuthService } from './auth.service';

function createConfig() {
  const values: Record<string, unknown> = {
    'auth.jwtAccessSecret': 'access-secret-ateliux-test',
    'auth.jwtRefreshSecret': 'refresh-secret-ateliux-test',
    'auth.jwtAccessExpiresIn': '15m',
    'auth.jwtRefreshExpiresIn': '7d',
  };

  return {
    getOrThrow<T = unknown>(key: string) {
      if (!(key in values)) throw new Error(`Missing config: ${key}`);
      return values[key] as T;
    },
  };
}

async function createService() {
  const passwordHash = await hash('Senha@123456', 12);
  const refreshTokens: Array<{
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }> = [];

  const client = {
    id: 'client-1',
    name: 'Cliente Ateliux',
    company: 'Cliente Co',
    email: 'cliente@ateliux.test',
    phone: null,
    plan: 'Enterprise',
    status: AccountStatus.ACTIVE,
  };
  const clientUser = {
    id: 'user-client',
    name: 'Cliente Ateliux',
    email: 'cliente@ateliux.test',
    passwordHash,
    role: UserRole.CLIENT,
    status: AccountStatus.ACTIVE,
    clientAccount: {
      id: 'client-account-1',
      userId: 'user-client',
      clientId: client.id,
      client,
    },
    adminProfile: null,
  };
  const adminProfile = {
    id: 'admin-1',
    userId: 'user-admin',
    role: AdminRole.ADMIN,
    avatarUrl: null,
  };
  const adminUser = {
    id: 'user-admin',
    name: 'Admin Ateliux',
    email: 'admin@ateliux.test',
    passwordHash,
    role: UserRole.ADMIN,
    status: AccountStatus.ACTIVE,
    adminProfile,
    clientAccount: null,
  };

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email === clientUser.email || where.id === clientUser.id) return clientUser;
        if (where.email === adminUser.email || where.id === adminUser.id) return adminUser;
        return null;
      },
    },
    clientAccount: {
      update: async () => clientUser.clientAccount,
    },
    refreshToken: {
      create: async ({ data }: { data: { userId: string; tokenHash: string; expiresAt: Date } }) => {
        const token = {
          id: `refresh-${refreshTokens.length + 1}`,
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          revokedAt: null,
          createdAt: new Date(Date.now() + refreshTokens.length),
        };
        refreshTokens.push(token);
        return token;
      },
      findMany: async ({ where }: { where: { userId: string } }) =>
        refreshTokens
          .filter((token) => token.userId === where.userId && !token.revokedAt && token.expiresAt > new Date())
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      update: async ({ where, data }: { where: { id: string }; data: { revokedAt: Date } }) => {
        const token = refreshTokens.find((item) => item.id === where.id);
        if (!token) throw new Error('Refresh token not found.');
        token.revokedAt = data.revokedAt;
        return token;
      },
      updateMany: async ({ where, data }: { where: { userId: string }; data: { revokedAt: Date } }) => {
        for (const token of refreshTokens) {
          if (token.userId === where.userId && !token.revokedAt) token.revokedAt = data.revokedAt;
        }
        return { count: refreshTokens.length };
      },
    },
  };

  return {
    service: new AuthService(prisma as never, new JwtService(), createConfig() as never),
    refreshTokens,
  };
}

describe('AuthService refresh flow', () => {
  it('renova sessao cliente com refresh token, rotaciona e bloqueia reuso', async () => {
    const { service, refreshTokens } = await createService();
    const login = await service.loginClient({
      email: 'cliente@ateliux.test',
      password: 'Senha@123456',
    });

    assert.equal(refreshTokens[0].tokenHash.startsWith('$2'), false);
    assert.equal(refreshTokens[0].tokenHash.length, 64);

    const refreshed = await service.refreshClient(login.tokens.refreshToken);

    assert.equal(refreshed.user.role, UserRole.CLIENT);
    assert.equal(refreshed.client?.id, 'client-1');
    assert.equal(refreshTokens.length, 2);
    assert.ok(refreshTokens[0].revokedAt instanceof Date);
    assert.equal(refreshTokens[1].revokedAt, null);
    assert.notEqual(refreshed.tokens.refreshToken, login.tokens.refreshToken);
    await assert.rejects(() => service.refreshClient(login.tokens.refreshToken), /Invalid refresh token/);
  });

  it('renova sessao admin com refresh token persistido', async () => {
    const { service, refreshTokens } = await createService();
    const login = await service.loginAdmin({
      email: 'admin@ateliux.test',
      password: 'Senha@123456',
    });

    const refreshed = await service.refreshAdmin(login.tokens.refreshToken);

    assert.equal(refreshed.user.role, UserRole.ADMIN);
    assert.equal(refreshed.admin?.id, 'admin-1');
    assert.equal(refreshTokens.length, 2);
    assert.ok(refreshTokens[0].revokedAt instanceof Date);
  });

  it('rejeita refresh ausente ou invalido', async () => {
    const { service } = await createService();

    await assert.rejects(() => service.refreshClient(null), /Refresh token missing/);
    await assert.rejects(() => service.refreshAdmin('token-invalido'), /Invalid refresh token/);
  });

  it('rejeita cadastro sem aceite legal obrigatorio', async () => {
    const { service } = await createService();

    await assert.rejects(
      () =>
        service.registerClient({
          name: 'Cliente Sem Aceite',
          email: 'novo@ateliux.test',
          password: 'Senha@123456',
          company: 'Empresa Teste',
          acceptTerms: false,
          acceptPrivacy: true,
        }),
      /Termos de uso e politica de privacidade/,
    );
  });
});
