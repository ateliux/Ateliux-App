import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { AccountStatus, UserRole } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
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

function expiresAtFromNow(value: string) {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;

  return new Date(Date.now() + amount * multiplier);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async registerClient(dto: RegisterClientDto) {
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
      client: user.clientAccount.client,
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
        client: account?.client ?? null,
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
        tokenHash: await hash(refreshToken, 12),
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  private safeUser(user: SafeAuthUser): SafeAuthUser {
    return user;
  }
}
