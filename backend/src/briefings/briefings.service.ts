import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BriefingStatus, VisibilityStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { BriefingResponseDto } from './dto/briefing-response.dto';
import type { CreateBriefingDto } from './dto/create-briefing.dto';
import type { UpdateBriefingDto } from './dto/update-briefing.dto';

@Injectable()
export class BriefingsService {
  constructor(private readonly prisma: PrismaService) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.briefing.findMany({
      where: { clientId: user.clientId, visibility: VisibilityStatus.VISIBLE_TO_CLIENT },
      orderBy: { createdAt: 'desc' },
      include: { responses: true, project: true },
    });
  }

  async findClientOne(user: RequestUser, id: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const briefing = await this.prisma.briefing.findFirst({
      where: { id, clientId: user.clientId, visibility: VisibilityStatus.VISIBLE_TO_CLIENT },
      include: { responses: true, project: true },
    });
    if (!briefing) throw new NotFoundException('Briefing not found.');
    return briefing;
  }

  findAdminAll() {
    return this.prisma.briefing.findMany({
      orderBy: { createdAt: 'desc' },
      include: { client: true, project: true, responses: true },
    });
  }

  create(dto: CreateBriefingDto) {
    return this.prisma.briefing.create({ data: dto });
  }

  async update(id: string, dto: UpdateBriefingDto) {
    await this.ensureExists(id);
    return this.prisma.briefing.update({ where: { id }, data: dto });
  }

  async send(id: string) {
    await this.ensureExists(id);
    return this.prisma.briefing.update({
      where: { id },
      data: {
        status: BriefingStatus.SENT,
        visibility: VisibilityStatus.VISIBLE_TO_CLIENT,
        sentAt: new Date(),
      },
    });
  }

  async respond(user: RequestUser, id: string, dto: BriefingResponseDto) {
    const briefing = await this.findClientOne(user, id);
    const response = await this.prisma.briefingResponse.create({
      data: {
        briefingId: briefing.id,
        clientId: briefing.clientId,
        projectId: briefing.projectId,
        answers: dto.answers,
      },
    });
    await this.prisma.briefing.update({ where: { id }, data: { status: BriefingStatus.ANSWERED } });
    return response;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.briefing.update({ where: { id }, data: { status: BriefingStatus.ARCHIVED } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const briefing = await this.prisma.briefing.findUnique({ where: { id } });
    if (!briefing) throw new NotFoundException('Briefing not found.');
    return briefing;
  }
}
