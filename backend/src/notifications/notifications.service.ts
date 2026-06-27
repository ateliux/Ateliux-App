import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationAudience } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.notification.findMany({
      where: { clientId: user.clientId, audience: NotificationAudience.CLIENT },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAdminAll() {
    return this.prisma.notification.findMany({
      where: { audience: NotificationAudience.ADMIN },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found.');
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
}
