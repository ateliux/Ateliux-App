import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VisibilityStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateScheduleEventDto } from './dto/create-schedule-event.dto';
import type { UpdateScheduleEventDto } from './dto/update-schedule-event.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.scheduleEvent.findMany({
      where: { clientId: user.clientId, visibility: VisibilityStatus.VISIBLE_TO_CLIENT },
      orderBy: { date: 'asc' },
    });
  }

  findAdminAll() {
    return this.prisma.scheduleEvent.findMany({
      orderBy: { date: 'asc' },
      include: { client: true, project: true },
    });
  }

  create(dto: CreateScheduleEventDto) {
    return this.prisma.scheduleEvent.create({
      data: {
        ...dto,
        date: new Date(dto.date),
      },
    });
  }

  async update(id: string, dto: UpdateScheduleEventDto) {
    await this.ensureExists(id);
    return this.prisma.scheduleEvent.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.scheduleEvent.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const event = await this.prisma.scheduleEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Schedule event not found.');
    return event;
  }
}
