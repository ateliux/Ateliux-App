import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAdminByClient(clientId: string) {
    return this.prisma.project.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: { client: true, manager: { include: { user: true } } },
    });
  }

  async findAdminOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { client: true, stages: true, briefings: true, approvals: true },
    });
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  findClientProjects(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.project.findMany({
      where: { clientId: user.clientId, visibleToClient: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findClientTeam(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const [client, projects] = await Promise.all([
      this.prisma.client.findUnique({
        where: { id: user.clientId },
        include: { responsible: { include: { user: true } } },
      }),
      this.prisma.project.findMany({
        where: { clientId: user.clientId, visibleToClient: true },
        include: { manager: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const members = new Map<string, unknown>();
    for (const project of projects) {
      if (!project.manager) continue;
      members.set(project.manager.id, {
        id: project.manager.id,
        name: project.manager.user.name,
        email: project.manager.user.email,
        role: project.manager.role,
        avatarUrl: project.manager.avatarUrl,
        projectId: project.id,
        projectName: project.name,
        areas: ['projeto', 'design', 'desenvolvimento'],
        primary: true,
      });
    }

    if (client?.responsible) {
      const existing = members.get(client.responsible.id) as Record<string, unknown> | undefined;
      members.set(client.responsible.id, {
        id: client.responsible.id,
        name: client.responsible.user.name,
        email: client.responsible.user.email,
        role: client.responsible.role,
        avatarUrl: client.responsible.avatarUrl,
        projectId: existing?.projectId,
        projectName: existing?.projectName,
        areas: existing?.areas ?? ['projeto', 'suporte'],
        primary: true,
      });
    }

    return Array.from(members.values());
  }

  async findClientProject(user: RequestUser, id: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const project = await this.prisma.project.findFirst({
      where: { id, clientId: user.clientId, visibleToClient: true },
      include: { stages: true, previews: true, scheduleEvents: true },
    });
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        clientId: dto.clientId,
        name: dto.name,
        type: dto.type,
        scope: dto.scope,
        status: dto.status,
        progress: dto.progress,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        currentStage: dto.currentStage,
        visibleToClient: dto.visibleToClient ?? false,
        managerId: dto.managerId,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findAdminOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        name: dto.name,
        type: dto.type,
        scope: dto.scope,
        status: dto.status,
        progress: dto.progress,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        currentStage: dto.currentStage,
        visibleToClient: dto.visibleToClient,
        managerId: dto.managerId,
      },
    });
  }

  async remove(id: string) {
    await this.findAdminOne(id);
    await this.prisma.project.update({ where: { id }, data: { status: ProjectStatus.ARCHIVED } });
    return { success: true };
  }
}
