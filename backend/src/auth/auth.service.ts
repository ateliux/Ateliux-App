import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { AccountStatus, type AdminRole, type Client, UserRole } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import { expiresAtFromNow } from './auth-time';
import type { LoginDto } from './dto/login.dto';
import type { RegisterClientDto } from './dto/register-client.dto';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

type SafeAuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  adminRole?: string;
  clientId?: string;
};

type SafeClient = Pick<Client, 'id' | 'name' | 'company' | 'email' | 'phone' | 'plan' | 'status' | 'responsibleId' | 'createdAt' | 'updatedAt'>;

type RefreshJwtPayload = {
  sub: string;
  tokenUse?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async registerClient(dto: RegisterClientDto) {
    if (!dto.acceptTerms || !dto.acceptPrivacy) {
      throw new BadRequestException('Termos de uso e politica de privacidade devem ser aceitos.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('E-mail already registered.');
    }

    const passwordHash = await hash(dto.password, 12);
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: UserRole.CLIENT,
          status: AccountStatus.ACTIVE,
        },
      });

      const client = await tx.client.create({
        data: {
          name: dto.name,
          company: dto.company,
          email: dto.email,
          phone: dto.phone,
          plan: dto.plan ?? 'Essencial',
          status: AccountStatus.ACTIVE,
        },
      });

      await tx.clientAccount.create({
        data: {
          userId: user.id,
          clientId: client.id,
          inviteStatus: AccountStatus.ACTIVE,
          lastAccessAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorType: 'client',
          action: 'CLIENT_LEGAL_ACCEPTANCE_REGISTERED',
          entityType: 'ClientAccount',
          clientId: client.id,
          metadata: {
            acceptTerms: dto.acceptTerms,
            acceptPrivacy: dto.acceptPrivacy,
            marketingOptIn: Boolean(dto.marketingOptIn),
            termsVersion: dto.termsVersion ?? '2026-06-terms-v1',
            privacyVersion: dto.privacyVersion ?? '2026-06-privacy-v1',
            legalReviewRequired: true,
          },
        },
      });

      return { user, client };
    });

    const tokens = await this.issueTokens({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      clientId: result.client.id,
    });

    return {
      user: this.safeUser({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        clientId: result.client.id,
      }),
      tokens,
    };
  }

  async loginClient(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { clientAccount: { include: { client: true } } },
    });

    if (!user || user.role !== UserRole.CLIENT || !user.clientAccount) {
      throw new UnauthorizedException('Invalid client credentials.');
    }

    await this.assertPassword(dto.password, user.passwordHash);
    await this.prisma.clientAccount.update({
      where: { id: user.clientAccount.id },
      data: { lastAccessAt: new Date() },
    });

    const tokens = await this.issueTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientAccount.clientId,
    });

    return {
      user: this.safeUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: user.clientAccount.clientId,
      }),
      client: this.safeClient(user.clientAccount.client),
      tokens,
    };
  }

  async loginAdmin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { adminProfile: true },
    });

    if (!user || user.role !== UserRole.ADMIN || !user.adminProfile) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    await this.assertPassword(dto.password, user.passwordHash);
    const tokens = await this.issueTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      adminRole: user.adminProfile.role,
      adminUserId: user.adminProfile.id,
    });

    return {
      user: this.safeUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminRole: user.adminProfile.role,
      }),
      admin: user.adminProfile,
      tokens,
    };
  }

  async logout(user: RequestUser) {
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  async logoutByRefreshToken(refreshToken: string | null) {
    if (!refreshToken) return { success: true };

    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      return { success: true };
    }

    return { success: true };
  }

  async refreshClient(refreshToken: string | null) {
    const session = await this.refresh(refreshToken, UserRole.CLIENT);
    return {
      user: session.user,
      client: session.client,
      tokens: session.tokens,
    };
  }

  async refreshAdmin(refreshToken: string | null) {
    const session = await this.refresh(refreshToken, UserRole.ADMIN);
    return {
      user: session.user,
      admin: session.admin,
      tokens: session.tokens,
    };
  }

  async me(user: RequestUser) {
    if (user.role === UserRole.CLIENT) {
      const account = await this.prisma.clientAccount.findUnique({
        where: { userId: user.id },
        include: { user: true, client: true },
      });

      return {
        user: account
          ? this.safeUser({
              id: account.user.id,
              name: account.user.name,
              email: account.user.email,
              role: account.user.role,
              clientId: account.clientId,
            })
          : user,
        client: account?.client ? this.safeClient(account.client) : null,
      };
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    return {
      user: admin
        ? this.safeUser({
            id: admin.user.id,
            name: admin.user.name,
            email: admin.user.email,
            role: admin.user.role,
            adminRole: admin.role,
          })
        : user,
      admin,
    };
  }

  private async assertPassword(password: string, passwordHash: string) {
    const valid = await compare(password, passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }

  private async refresh(refreshToken: string | null, expectedRole: UserRole) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing.');
    }

    const payload = await this.verifyRefreshToken(refreshToken);
    const storedToken = await this.findValidStoredRefreshToken(payload.sub, refreshToken);
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        adminProfile: true,
        clientAccount: { include: { client: true } },
      },
    });

    if (!user || user.status !== AccountStatus.ACTIVE || user.role !== expectedRole) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (expectedRole === UserRole.ADMIN && !user.adminProfile) {
      throw new UnauthorizedException('Invalid admin refresh token.');
    }

    if (expectedRole === UserRole.CLIENT && !user.clientAccount) {
      throw new UnauthorizedException('Invalid client refresh token.');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const requestUser =
      expectedRole === UserRole.ADMIN
        ? {
            id: user.id,
            email: user.email,
            role: user.role,
            adminRole: user.adminProfile!.role,
            adminUserId: user.adminProfile!.id,
          }
        : {
            id: user.id,
            email: user.email,
            role: user.role,
            clientId: user.clientAccount!.clientId,
          };

    const tokens = await this.issueTokens(requestUser);

    return {
      user: this.safeUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.adminProfile
          ? { adminRole: user.adminProfile.role as AdminRole }
          : { clientId: user.clientAccount!.clientId }),
      }),
      admin: user.adminProfile,
      client: user.clientAccount?.client ? this.safeClient(user.clientAccount.client) : null,
      tokens,
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<RefreshJwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('auth.jwtRefreshSecret'),
      });

      if (payload.tokenUse !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private async findValidStoredRefreshToken(userId: string, refreshToken: string) {
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const storedToken of activeTokens) {
      if (await this.refreshTokenMatches(refreshToken, storedToken.tokenHash)) {
        return storedToken;
      }
    }

    return null;
  }

  private async issueTokens(payload: RequestUser): Promise<AuthTokens> {
    const refreshExpiresAt = expiresAtFromNow(
      this.config.getOrThrow<string>('auth.jwtRefreshExpiresIn'),
    );
    const accessExpiresIn = this.config.getOrThrow<string>(
      'auth.jwtAccessExpiresIn',
    ) as JwtSignOptions['expiresIn'];
    const refreshExpiresIn = this.config.getOrThrow<string>(
      'auth.jwtRefreshExpiresIn',
    ) as JwtSignOptions['expiresIn'];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: payload.id,
          email: payload.email,
          role: payload.role,
          adminRole: payload.adminRole,
          adminUserId: payload.adminUserId,
          clientId: payload.clientId,
        },
        {
          secret: this.config.getOrThrow<string>('auth.jwtAccessSecret'),
          expiresIn: accessExpiresIn,
        },
      ),
      this.jwt.signAsync(
        {
          sub: payload.id,
          tokenUse: 'refresh',
          jti: randomUUID(),
        },
        {
          secret: this.config.getOrThrow<string>('auth.jwtRefreshSecret'),
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    await this.prisma.refreshToken.create({
      data: {
        userId: payload.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  private hashRefreshToken(refreshToken: string) {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private async refreshTokenMatches(refreshToken: string, storedHash: string) {
    if (storedHash.startsWith('$2')) {
      return compare(refreshToken, storedHash);
    }

    const currentHash = Buffer.from(this.hashRefreshToken(refreshToken), 'hex');
    const persistedHash = Buffer.from(storedHash, 'hex');
    return currentHash.length === persistedHash.length && timingSafeEqual(currentHash, persistedHash);
  }

  private safeUser(user: SafeAuthUser): SafeAuthUser {
    return user;
  }

  private safeClient(client: Client): SafeClient {
    return {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      plan: client.plan,
      status: client.status,
      responsibleId: client.responsibleId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
