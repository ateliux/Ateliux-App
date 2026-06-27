import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateProjectStageDto } from './dto/create-project-stage.dto';
import type { UpdateProjectStageDto } from './dto/update-project-stage.dto';

@Injectable()
export class ProjectStagesService {
  constructor(private readonly prisma: PrismaService) {}

  findClientByProject(user: RequestUser, projectId: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.projectStage.findMany({
      where: { clientId: user.clientId, projectId, status: { not: StageStatus.DRAFT } },
      orderBy: { order: 'asc' },
    });
  }

  findAdminAll() {
    return this.prisma.projectStage.findMany({
      orderBy: [{ clientId: 'asc' }, { order: 'asc' }],
      include: { client: true, project: true },
    });
  }

  async create(dto: CreateProjectStageDto) {
    return this.prisma.projectStage.create({
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateProjectStageDto) {
    await this.ensureExists(id);
    return this.prisma.projectStage.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async sendToClient(id: string) {
    await this.ensureExists(id);
    return this.prisma.projectStage.update({
      where: { id },
      data: {
        status: StageStatus.SENT_TO_CLIENT,
        sentToClientAt: new Date(),
      },
    });
  }

  async requestApproval(id: string) {
    await this.ensureExists(id);
    return this.prisma.projectStage.update({
      where: { id },
      data: {
        status: StageStatus.WAITING_APPROVAL,
        requiresApproval: true,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.projectStage.update({ where: { id }, data: { status: StageStatus.ARCHIVED } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const stage = await this.prisma.projectStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Project stage not found.');
    return stage;
  }
}
