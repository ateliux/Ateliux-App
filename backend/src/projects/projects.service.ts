import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AccountStatus,
  AdminRole,
  ApprovalStatus,
  BriefingStatus,
  FileStatus,
  FinanceStatus,
  NotificationAudience,
  Priority,
  ProjectStatus,
  RequestStatus,
  StageStatus,
  VisibilityStatus,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { CreateProjectFullSetupDto, InitialProjectStageSetupDto } from './dto/create-project-full-setup.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';

const projectInclude = {
  client: true,
  manager: { include: { user: true } },
  teamMembers: { include: { adminUser: { include: { user: true } } } },
  stages: { orderBy: { order: 'asc' } },
  briefings: { orderBy: { createdAt: 'desc' } },
  approvals: { orderBy: { createdAt: 'desc' } },
  previews: { orderBy: { createdAt: 'desc' } },
  scheduleEvents: { orderBy: { date: 'asc' } },
  financeRecords: { orderBy: { dueDate: 'asc' } },
} as const satisfies Prisma.ProjectInclude;

const projectOverviewInclude = {
  client: {
    include: {
      account: { include: { user: true } },
      responsible: { include: { user: true } },
      projects: {
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
          visibleToClient: true,
          updatedAt: true,
        },
      },
    },
  },
  manager: { include: { user: true } },
  teamMembers: {
    orderBy: { createdAt: 'asc' },
    include: { adminUser: { include: { user: true } } },
  },
  stages: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
  briefings: {
    orderBy: { createdAt: 'desc' },
    include: { responses: { orderBy: { submittedAt: 'desc' } } },
  },
  files: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      project: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  },
  approvals: {
    orderBy: { createdAt: 'desc' },
    include: { preview: true },
  },
  previews: {
    orderBy: { createdAt: 'desc' },
    include: { approvals: { orderBy: { createdAt: 'desc' } } },
  },
  scheduleEvents: { orderBy: { date: 'asc' } },
  financeRecords: {
    orderBy: { dueDate: 'asc' },
    include: { receiptFile: true },
  },
  auditLogs: {
    orderBy: { createdAt: 'desc' },
    take: 50,
  },
  clientRequests: {
    orderBy: { createdAt: 'desc' },
    include: { attachments: { include: { fileAsset: true } } },
  },
  inboxConversations: {
    orderBy: { updatedAt: 'desc' },
    include: {
      assignee: { include: { user: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 25,
        include: { attachments: true },
      },
    },
  },
} as const satisfies Prisma.ProjectInclude;

const pendingApprovalStatuses = new Set<ApprovalStatus>([
  ApprovalStatus.SENT,
  ApprovalStatus.WAITING_CLIENT,
  ApprovalStatus.RESENT,
]);
const closedRequestStatuses = new Set<RequestStatus>([
  RequestStatus.COMPLETED,
  RequestStatus.ARCHIVED,
]);
const pendingFinanceStatuses = new Set<FinanceStatus>([
  FinanceStatus.PENDING,
  FinanceStatus.OVERDUE,
]);

type ProjectOverviewPayload = Prisma.ProjectGetPayload<{ include: typeof projectOverviewInclude }>;
type ProjectOverviewPermissions = {
  canViewWorkspace: boolean;
  canEditProject: boolean;
  canEditTeam: boolean;
  canEditFinance: boolean;
  canEditFiles: boolean;
  canEditStages: boolean;
  canEditBriefings: boolean;
  canManageTeam: boolean;
  canManageScope: boolean;
  canManageStages: boolean;
  canManageBriefings: boolean;
  canManageFiles: boolean;
  canManageApprovals: boolean;
  canManagePreviews: boolean;
  canManageSchedule: boolean;
  canViewFinance: boolean;
  canManageFinance: boolean;
  canManageHistory: boolean;
  canManagePortalSettings: boolean;
  canViewSupport: boolean;
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAdminByClient(clientId: string) {
    return this.prisma.project.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: projectInclude,
    });
  }

  async findAdminOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  async findAdminOverview(id: string, user: RequestUser) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectOverviewInclude,
    });
    if (!project) throw new NotFoundException('Project not found.');

    const permissions = this.resolveProjectWorkspacePermissions(user.adminRole);
    const team = this.buildProjectWorkspaceTeam(project);
    const financeRecords = permissions.canViewFinance
      ? project.financeRecords.map((record) => ({
          ...record,
          amount: Number(record.amount),
        }))
      : [];

    return {
      project: this.toProjectOverview(project),
      client: this.toProjectClientOverview(project),
      team,
      stages: project.stages,
      briefings: project.briefings,
      files: project.files,
      approvals: project.approvals,
      previews: project.previews,
      schedule: project.scheduleEvents,
      finance: financeRecords,
      history: project.auditLogs,
      requests: project.clientRequests,
      inbox: project.inboxConversations,
      stats: this.buildProjectWorkspaceStats(project, permissions, team.length),
      permissions,
    };
  }

  findClientProjects(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.project.findMany({
      where: { clientId: user.clientId, visibleToClient: true },
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        manager: { include: { user: true } },
        teamMembers: { include: { adminUser: { include: { user: true } } } },
      },
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
        include: {
          manager: { include: { user: true } },
          teamMembers: { include: { adminUser: { include: { user: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const members = new Map<string, unknown>();
    for (const project of projects) {
      if (project.manager) {
        members.set(project.manager.id, {
          id: project.manager.id,
          name: project.manager.user.name,
          email: project.manager.user.email,
          role: project.manager.role,
          avatarUrl: project.manager.avatarUrl,
          projectId: project.id,
          projectName: project.name,
          areas: ['gestao', 'projeto', 'cliente'],
          primary: true,
        });
      }

      for (const member of project.teamMembers) {
        const admin = member.adminUser;
        members.set(admin.id, {
          id: admin.id,
          name: admin.user.name,
          email: admin.user.email,
          role: member.roleLabel ?? admin.role,
          avatarUrl: admin.avatarUrl,
          projectId: project.id,
          projectName: project.name,
          areas: ['projeto', 'execucao'],
          primary: false,
        });
      }
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
        areas: existing?.areas ?? ['relacionamento', 'suporte'],
        primary: true,
      });
    }

    return Array.from(members.values());
  }

  async findClientProject(user: RequestUser, id: string) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    const project = await this.prisma.project.findFirst({
      where: { id, clientId: user.clientId, visibleToClient: true },
      include: {
        client: true,
        manager: { include: { user: true } },
        teamMembers: { include: { adminUser: { include: { user: true } } } },
        stages: { where: { status: { not: StageStatus.DRAFT } }, orderBy: { order: 'asc' } },
        previews: true,
        scheduleEvents: { where: { visibility: VisibilityStatus.VISIBLE_TO_CLIENT }, orderBy: { date: 'asc' } },
        financeRecords: { where: { visibleToClient: true }, orderBy: { dueDate: 'asc' } },
      },
    });
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  async create(dto: CreateProjectDto, user?: RequestUser) {
    await this.ensureClient(dto.clientId);
    await this.ensureManager(dto.managerId);
    this.assertPortalProjectReady({
      visibleToClient: dto.visibleToClient ?? false,
      managerId: dto.managerId,
      currentStage: dto.currentStage,
      progress: dto.progress ?? 0,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      scope: dto.scope,
      description: dto.description,
      clientFacingSummary: dto.clientFacingSummary,
    });

    const project = await this.prisma.project.create({
      data: {
        clientId: dto.clientId,
        name: dto.name,
        type: dto.type,
        scope: dto.scope,
        description: dto.description,
        status: dto.status ?? ProjectStatus.DRAFT,
        priority: dto.priority ?? Priority.MEDIUM,
        progress: dto.progress ?? 0,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        currentStage: dto.currentStage,
        clientFacingSummary: dto.clientFacingSummary,
        internalNotes: dto.internalNotes,
        visibleToClient: dto.visibleToClient ?? false,
        managerId: dto.managerId,
      },
      include: projectInclude,
    });

    await this.syncClientResponsible(dto.clientId, dto.managerId);
    await this.createProjectHistory(project.id, dto.clientId, user, {
      title: 'Projeto criado pela equipe Ateliux.',
      description: `Responsavel definido: ${project.manager?.user.name ?? 'Equipe Ateliux'}. Etapa inicial: ${project.currentStage ?? 'Nao definida'}.`,
    });

    return project;
  }

  async createFullSetup(user: RequestUser, dto: CreateProjectFullSetupDto) {
    const [client, manager] = await Promise.all([
      this.ensureClient(dto.clientId),
      this.ensureManager(dto.managerId),
    ]);
    const teamIds = await this.ensureTeam(dto.teamIds ?? [], dto.managerId);
    const currentStage = this.resolveCurrentStage(dto);
    const initialStages = this.resolveInitialStages(dto, currentStage);
    this.assertPortalProjectReady({
      visibleToClient: dto.visibleToClient,
      managerId: dto.managerId,
      currentStage,
      progress: dto.progress,
      deadline: new Date(dto.deadline),
      scope: dto.scope,
      description: dto.description,
      clientFacingSummary: dto.clientFacingSummary,
    });

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          clientId: dto.clientId,
          name: dto.name,
          type: dto.type,
          scope: dto.scope,
          description: dto.description,
          status: dto.status ?? ProjectStatus.ACTIVE,
          priority: dto.priority ?? Priority.MEDIUM,
          progress: dto.progress ?? 0,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          deadline: dto.deadline ? new Date(dto.deadline) : undefined,
          currentStage,
          clientFacingSummary: dto.clientFacingSummary,
          internalNotes: dto.internalNotes,
          visibleToClient: dto.visibleToClient,
          managerId: dto.managerId,
        },
      });

      if (!client.responsibleId) {
        await tx.client.update({
          where: { id: dto.clientId },
          data: { responsibleId: dto.managerId },
        });
      }

      if (teamIds.length) {
        await tx.projectTeamMember.createMany({
          data: teamIds.map((adminUserId) => ({
            projectId: project.id,
            adminUserId,
          })),
          skipDuplicates: true,
        });
      }

      await tx.projectStage.createMany({
        data: initialStages.map((stage, index) => {
          const visible = stage.visibleToClient ?? dto.visibleToClient;
          const status = visible ? stage.status ?? StageStatus.SENT_TO_CLIENT : StageStatus.DRAFT;
          return {
            clientId: dto.clientId,
            projectId: project.id,
            title: stage.title,
            description: stage.description ?? dto.clientFacingSummary ?? dto.scope,
            order: stage.order ?? index + 1,
            status,
            clientStatus: visible ? 'Publicado no Portal do Cliente' : 'Interno',
            deadline: stage.dueDate ? new Date(stage.dueDate) : undefined,
            requiresApproval: stage.requiresApproval ?? false,
            sentToClientAt: status === StageStatus.DRAFT ? undefined : new Date(),
          };
        }),
      });

      if (dto.initialBriefing) {
        const visibility = dto.initialBriefing.visibility ?? VisibilityStatus.VISIBLE_TO_CLIENT;
        await tx.briefing.create({
          data: {
            clientId: dto.clientId,
            projectId: project.id,
            title: dto.initialBriefing.title,
            type: 'Briefing inicial',
            description: dto.initialBriefing.description,
            status: dto.initialBriefing.status ?? (visibility === VisibilityStatus.VISIBLE_TO_CLIENT ? BriefingStatus.SENT : BriefingStatus.DRAFT),
            visibility,
            sentAt: visibility === VisibilityStatus.VISIBLE_TO_CLIENT ? new Date() : undefined,
            createdById: user.adminUserId ?? user.id,
          },
        });
      }

      if (dto.initialScheduleEvents?.length) {
        await tx.scheduleEvent.createMany({
          data: dto.initialScheduleEvents.map((event) => ({
            clientId: dto.clientId,
            projectId: project.id,
            title: event.title,
            type: event.type,
            date: new Date(event.date),
            time: event.time,
            responsible: event.responsible ?? manager.user.name,
            notes: event.notes,
            visibility: event.visibleToClient === false ? VisibilityStatus.INTERNAL : VisibilityStatus.VISIBLE_TO_CLIENT,
          })),
        });
      }

      if (dto.initialFinance) {
        await tx.financeRecord.create({
          data: {
            clientId: dto.clientId,
            projectId: project.id,
            description: dto.initialFinance.description,
            amount: dto.initialFinance.amount,
            dueDate: new Date(dto.initialFinance.dueDate),
            installment: dto.initialFinance.installment,
            status: dto.initialFinance.status,
            visibleToClient: dto.initialFinance.visibleToClient ?? true,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: user.adminUserId ?? user.id,
          actorType: 'admin',
          action: 'PROJECT_CREATED_FULL_SETUP',
          entityType: 'Project',
          entityId: project.id,
          clientId: dto.clientId,
          projectId: project.id,
          metadata: {
            title: 'Projeto criado pela equipe Ateliux.',
            description: `Responsavel definido: ${manager.user.name}. Etapa inicial: ${currentStage}.`,
            managerId: dto.managerId,
            teamIds,
            visibleToClient: dto.visibleToClient,
          },
        },
      });

      if (dto.visibleToClient && client.account?.userId) {
        await tx.notification.create({
          data: {
            recipientId: client.account.userId,
            audience: NotificationAudience.CLIENT,
            clientId: dto.clientId,
            projectId: project.id,
            type: 'project.created',
            title: 'Projeto publicado no Portal',
            body: `${dto.name} ja esta disponivel para acompanhamento.`,
            entityType: 'Project',
            entityId: project.id,
          },
        });
      }

      return tx.project.findUniqueOrThrow({
        where: { id: project.id },
        include: projectInclude,
      });
    });
  }

  async update(id: string, dto: UpdateProjectDto, user?: RequestUser) {
    const previous = await this.findAdminOne(id);
    if (dto.clientId) await this.ensureClient(dto.clientId);
    const nextManagerId = dto.managerId ?? previous.managerId ?? undefined;
    if (nextManagerId) await this.ensureManager(nextManagerId);
    const teamIds = dto.teamIds === undefined ? undefined : await this.ensureTeam(dto.teamIds, nextManagerId ?? '');
    const nextDeadline = dto.deadline ? new Date(dto.deadline) : previous.deadline;
    this.assertPortalProjectReady({
      visibleToClient: dto.visibleToClient ?? previous.visibleToClient,
      managerId: nextManagerId,
      currentStage: dto.currentStage ?? previous.currentStage,
      progress: dto.progress ?? previous.progress,
      deadline: nextDeadline,
      scope: dto.scope ?? previous.scope,
      description: dto.description ?? previous.description,
      clientFacingSummary: dto.clientFacingSummary ?? previous.clientFacingSummary,
    });

    const project = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id },
        data: {
          clientId: dto.clientId,
          name: dto.name,
          type: dto.type,
          scope: dto.scope,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          progress: dto.progress,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          deadline: dto.deadline ? new Date(dto.deadline) : undefined,
          currentStage: dto.currentStage,
          clientFacingSummary: dto.clientFacingSummary,
          internalNotes: dto.internalNotes,
          visibleToClient: dto.visibleToClient,
          managerId: dto.managerId,
        },
        include: projectInclude,
      });

      if (teamIds !== undefined) {
        await tx.projectTeamMember.deleteMany({ where: { projectId: id } });
        if (teamIds.length) {
          await tx.projectTeamMember.createMany({
            data: teamIds.map((adminUserId) => ({ projectId: id, adminUserId })),
            skipDuplicates: true,
          });
        }
      }

      return updated;
    });

    if (dto.managerId) await this.syncClientResponsible(project.clientId, dto.managerId, true);
    await this.createUpdateHistory(previous, project, user);
    return project;
  }

  async remove(id: string) {
    await this.findAdminOne(id);
    await this.prisma.project.update({ where: { id }, data: { status: ProjectStatus.ARCHIVED } });
    return { success: true };
  }

  private async ensureClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { account: true },
    });
    if (!client) throw new NotFoundException('Client not found.');
    if (client.status === AccountStatus.ARCHIVED) {
      throw new BadRequestException('Archived client cannot receive new projects.');
    }
    return client;
  }

  private async ensureManager(managerId: string) {
    const manager = await this.prisma.adminUser.findUnique({
      where: { id: managerId },
      include: { user: true },
    });
    if (!manager || manager.user.status !== AccountStatus.ACTIVE) {
      throw new BadRequestException('Project manager is required and must be an active admin user.');
    }
    return manager;
  }

  private async ensureTeam(teamIds: string[], managerId: string) {
    const uniqueIds = Array.from(new Set(teamIds.filter(Boolean))).filter((id) => id !== managerId);
    if (!uniqueIds.length) return [];

    const users = await this.prisma.adminUser.findMany({
      where: { id: { in: uniqueIds }, user: { status: AccountStatus.ACTIVE } },
      select: { id: true },
    });
    const found = new Set(users.map((item) => item.id));
    const missing = uniqueIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new BadRequestException('Project team contains invalid admin users.');
    }
    return uniqueIds;
  }

  private async syncClientResponsible(clientId: string, managerId: string, overwrite = false) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (client && (overwrite || !client.responsibleId)) {
      await this.prisma.client.update({ where: { id: clientId }, data: { responsibleId: managerId } });
    }
  }

  private assertPortalProjectReady(input: {
    visibleToClient: boolean;
    managerId?: string | null;
    currentStage?: string | null;
    progress?: number | null;
    deadline?: Date | string | null;
    scope?: string | null;
    description?: string | null;
    clientFacingSummary?: string | null;
  }) {
    if (!input.visibleToClient) return;
    const hasSummary = Boolean(input.clientFacingSummary?.trim() || input.scope?.trim() || input.description?.trim());
    if (!input.managerId?.trim()) {
      throw new BadRequestException('Projeto visivel no Portal exige responsavel principal.');
    }
    if (!input.currentStage?.trim()) {
      throw new BadRequestException('Projeto visivel no Portal exige etapa atual.');
    }
    if (input.progress === null || input.progress === undefined || input.progress < 0 || input.progress > 100) {
      throw new BadRequestException('Projeto visivel no Portal exige progresso entre 0 e 100.');
    }
    if (!input.deadline || Number.isNaN(new Date(input.deadline).getTime())) {
      throw new BadRequestException('Projeto visivel no Portal exige prazo valido.');
    }
    if (!hasSummary) {
      throw new BadRequestException('Projeto visivel no Portal exige escopo ou resumo para o cliente.');
    }
  }

  private resolveCurrentStage(dto: CreateProjectFullSetupDto) {
    return dto.currentStage?.trim() || dto.initialStages?.[0]?.title?.trim() || 'Planejamento inicial';
  }

  private resolveInitialStages(dto: CreateProjectFullSetupDto, currentStage: string): InitialProjectStageSetupDto[] {
    if (dto.initialStages?.length) return dto.initialStages;
    return [
      {
        title: currentStage,
        description: dto.clientFacingSummary ?? dto.description ?? dto.scope,
        order: 1,
        status: dto.visibleToClient ? StageStatus.SENT_TO_CLIENT : StageStatus.DRAFT,
        visibleToClient: dto.visibleToClient,
      },
    ];
  }

  private createProjectHistory(
    projectId: string,
    clientId: string,
    user: RequestUser | undefined,
    metadata: { title: string; description: string },
  ) {
    return this.prisma.auditLog.create({
      data: {
        actorId: user?.adminUserId ?? user?.id,
        actorType: user ? 'admin' : 'system',
        action: 'PROJECT_CREATED',
        entityType: 'Project',
        entityId: projectId,
        clientId,
        projectId,
        metadata,
      },
    });
  }

  private async createUpdateHistory(
    previous: Awaited<ReturnType<ProjectsService['findAdminOne']>>,
    project: Awaited<ReturnType<ProjectsService['findAdminOne']>>,
    user: RequestUser | undefined,
  ) {
    const changes: Array<{ field: string; title: string; before: unknown; after: unknown }> = [];
    if (previous.managerId !== project.managerId) {
      changes.push({ field: 'managerId', title: 'Responsavel alterado', before: previous.managerId, after: project.managerId });
    }
    if (previous.deadline?.toISOString() !== project.deadline?.toISOString()) {
      changes.push({ field: 'deadline', title: 'Prazo alterado', before: previous.deadline, after: project.deadline });
    }
    if (previous.status !== project.status) {
      changes.push({ field: 'status', title: 'Status alterado', before: previous.status, after: project.status });
    }
    if (previous.currentStage !== project.currentStage) {
      changes.push({ field: 'currentStage', title: 'Etapa atual alterada', before: previous.currentStage, after: project.currentStage });
    }
    if (previous.visibleToClient !== project.visibleToClient) {
      changes.push({
        field: 'visibleToClient',
        title: project.visibleToClient ? 'Projeto publicado no Portal' : 'Projeto ocultado do Portal',
        before: previous.visibleToClient,
        after: project.visibleToClient,
      });
    }
    if (!changes.length) return;

    await this.prisma.auditLog.createMany({
      data: changes.map((change) => ({
        actorId: user?.adminUserId ?? user?.id,
        actorType: user ? 'admin' : 'system',
        action: `PROJECT_${change.field.toUpperCase()}_UPDATED`,
        entityType: 'Project',
        entityId: project.id,
        clientId: project.clientId,
        projectId: project.id,
        metadata: {
          title: change.title,
          description: `${change.title} pela equipe Ateliux.`,
          before: this.serializeChangeValue(change.before),
          after: this.serializeChangeValue(change.after),
        },
      })),
    });

    if (project.visibleToClient) {
      const client = await this.prisma.client.findUnique({
        where: { id: project.clientId },
        include: { account: true },
      });
      if (client?.account?.userId) {
        await this.prisma.notification.create({
          data: {
            recipientId: client.account.userId,
            audience: NotificationAudience.CLIENT,
            clientId: project.clientId,
            projectId: project.id,
            type: 'project.updated',
            title: 'Projeto atualizado',
            body: changes.map((change) => change.title).join(', '),
            entityType: 'Project',
            entityId: project.id,
          },
        });
      }
    }
  }

  private serializeChangeValue(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
      return value;
    }
    return value === undefined ? null : String(value);
  }

  private toProjectOverview(project: ProjectOverviewPayload) {
    return {
      id: project.id,
      clientId: project.clientId,
      name: project.name,
      type: project.type,
      scope: project.scope,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      startDate: project.startDate,
      deadline: project.deadline,
      currentStage: project.currentStage,
      clientFacingSummary: project.clientFacingSummary,
      internalNotes: project.internalNotes,
      visibleToClient: project.visibleToClient,
      managerId: project.managerId,
      manager: project.manager
        ? {
            id: project.manager.id,
            name: project.manager.user.name,
            email: project.manager.user.email,
            role: project.manager.role,
          }
        : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private toProjectClientOverview(project: ProjectOverviewPayload) {
    const client = project.client;
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
      account: client.account
        ? {
            id: client.account.id,
            inviteStatus: client.account.inviteStatus,
            lastAccessAt: client.account.lastAccessAt,
            user: {
              id: client.account.user.id,
              name: client.account.user.name,
              email: client.account.user.email,
              status: client.account.user.status,
            },
          }
        : null,
      responsible: client.responsible
        ? {
            id: client.responsible.id,
            role: client.responsible.role,
            avatarUrl: client.responsible.avatarUrl,
            user: {
              id: client.responsible.user.id,
              name: client.responsible.user.name,
              email: client.responsible.user.email,
            },
          }
        : null,
      projects: client.projects,
    };
  }

  private buildProjectWorkspaceTeam(project: ProjectOverviewPayload) {
    const members = new Map<
      string,
      {
        id: string;
        userId: string;
        name: string;
        email: string;
        role: AdminRole | string;
        avatarUrl: string | null;
        primary: boolean;
        source: 'manager' | 'team';
      }
    >();

    if (project.manager) {
      members.set(project.manager.id, {
        id: project.manager.id,
        userId: project.manager.userId,
        name: project.manager.user.name,
        email: project.manager.user.email,
        role: project.manager.role,
        avatarUrl: project.manager.avatarUrl,
        primary: true,
        source: 'manager',
      });
    }

    for (const member of project.teamMembers) {
      const adminUser = member.adminUser;
      if (members.has(adminUser.id)) continue;
      members.set(adminUser.id, {
        id: adminUser.id,
        userId: adminUser.userId,
        name: adminUser.user.name,
        email: adminUser.user.email,
        role: member.roleLabel ?? adminUser.role,
        avatarUrl: adminUser.avatarUrl,
        primary: false,
        source: 'team',
      });
    }

    return Array.from(members.values());
  }

  private buildProjectWorkspaceStats(
    project: ProjectOverviewPayload,
    permissions: ProjectOverviewPermissions,
    teamMembersCount: number,
  ) {
    const now = new Date();
    return {
      teamMembers: teamMembersCount,
      stages: project.stages.length,
      briefings: project.briefings.length,
      pendingApprovals: project.approvals.filter((approval) => pendingApprovalStatuses.has(approval.status)).length,
      pendingFiles: project.files.filter((file) => file.status === FileStatus.PENDING_REVIEW).length,
      openRequests: project.clientRequests.filter((request) => !closedRequestStatuses.has(request.status)).length,
      upcomingEvents: project.scheduleEvents.filter((event) => event.date >= now).length,
      pendingPayments: permissions.canViewFinance
        ? project.financeRecords.filter((record) => pendingFinanceStatuses.has(record.status)).length
        : 0,
      historyEvents: project.auditLogs.length,
      inboxThreads: project.inboxConversations.length,
    };
  }

  private resolveProjectWorkspacePermissions(role?: AdminRole) {
    const isAdmin = role === AdminRole.ADMIN;
    const isProjectManager = role === AdminRole.PROJECT_MANAGER;
    const isDesignerDev = role === AdminRole.DESIGNER_DEV;
    const isSupport = role === AdminRole.SUPPORT;
    const isFinance = role === AdminRole.FINANCE;
    const canLeadProject = isAdmin || isProjectManager;
    const canExecuteProject = canLeadProject || isDesignerDev;

    return {
      canViewWorkspace: canLeadProject || isDesignerDev || isSupport || isFinance,
      canEditProject: canLeadProject,
      canEditTeam: canLeadProject,
      canEditFinance: isAdmin || isFinance,
      canEditFiles: canExecuteProject || isSupport,
      canEditStages: canExecuteProject,
      canEditBriefings: canExecuteProject,
      canManageTeam: canLeadProject,
      canManageScope: canExecuteProject,
      canManageStages: canExecuteProject,
      canManageBriefings: canExecuteProject,
      canManageFiles: canExecuteProject || isSupport,
      canManageApprovals: canExecuteProject,
      canManagePreviews: canExecuteProject,
      canManageSchedule: canLeadProject,
      canViewFinance: canLeadProject || isFinance,
      canManageFinance: isAdmin || isFinance,
      canManageHistory: canLeadProject || isDesignerDev || isSupport || isFinance,
      canManagePortalSettings: canLeadProject,
      canViewSupport: canLeadProject || isSupport,
    };
  }
}
