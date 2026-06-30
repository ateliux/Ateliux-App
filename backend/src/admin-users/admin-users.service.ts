import { Injectable } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.adminUser.findMany({
      where: { user: { status: AccountStatus.ACTIVE } },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });
  }
}
