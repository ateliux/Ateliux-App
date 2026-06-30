/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Reflector } from '@nestjs/core';
import {
  AccountStatus,
  AdminRole,
  ApprovalStatus,
  FileContext,
  FileDownloadMode,
  FileOrigin,
  FileRiskLevel,
  FileStatus,
  FileUploadedByType,
  FileVisibility,
  FinanceStatus,
  Priority,
  ProjectStatus,
  RequestStatus,
  StageStatus,
  UserRole,
} from '@prisma/client';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/utils/request-user';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

function createPrismaMock() {
  const calls = {
    projects: [] as unknown[],
    stages: [] as unknown[],
    briefings: [] as unknown[],
    schedule: [] as unknown[],
    finance: [] as unknown[],
    history: [] as unknown[],
    notifications: [] as unknown[],
    team: [] as unknown[],
    clientUpdates: [] as unknown[],
  };

  const client = {
    id: 'client-1',
    name: 'Cliente',
    company: 'Empresa',
    email: 'cliente@ateliux.test',
    phone: '11999999999',
    plan: 'Enterprise',
    status: AccountStatus.ACTIVE,
    responsibleId: 'admin-1',
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-15'),
    account: {
      id: 'account-1',
      userId: 'user-client-1',
      inviteStatus: AccountStatus.ACTIVE,
      lastAccessAt: new Date('2026-06-20'),
      user: {
        id: 'user-client-1',
        name: 'Cliente',
        email: 'cliente@ateliux.test',
        status: AccountStatus.ACTIVE,
      },
    },
    responsible: undefined as unknown,
    projects: [] as unknown[],
  };
  const manager = {
    id: 'admin-1',
    userId: 'user-admin-1',
    role: AdminRole.PROJECT_MANAGER,
    avatarUrl: null,
    user: {
      id: 'user-admin-1',
      name: 'Lina Armand',
      email: 'lina@ateliux.test',
      status: AccountStatus.ACTIVE,
    },
  };
  const designer = {
    id: 'admin-2',
    userId: 'user-admin-2',
    role: AdminRole.DESIGNER_DEV,
    avatarUrl: null,
    user: {
      id: 'user-admin-2',
      name: 'Design Ateliux',
      email: 'design@ateliux.test',
      status: AccountStatus.ACTIVE,
    },
  };
  client.responsible = manager;
  client.projects = [
    {
      id: 'project-1',
      name: 'Portal do Cliente',
      status: ProjectStatus.ACTIVE,
      progress: 10,
      visibleToClient: true,
      updatedAt: new Date('2026-06-22'),
    },
  ];

  let storedProject: Record<string, unknown> = {
    id: 'project-1',
    clientId: client.id,
    name: 'Portal do Cliente',
    type: 'SaaS',
    scope: 'Portal, auth e dashboards',
    description: 'Projeto completo',
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 10,
    deadline: new Date('2026-08-01'),
    startDate: new Date('2026-07-01'),
    currentStage: 'Planejamento',
    clientFacingSummary: 'Resumo para o cliente',
    internalNotes: 'Nota interna',
    visibleToClient: true,
    managerId: manager.id,
    client,
    manager,
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-22'),
    teamMembers: [{ id: 'member-1', roleLabel: 'UI Engineer', createdAt: new Date('2026-06-02'), adminUser: designer }],
    stages: [
      {
        id: 'stage-1',
        clientId: client.id,
        projectId: 'project-1',
        title: 'Planejamento',
        description: 'Etapa inicial',
        status: StageStatus.WAITING_APPROVAL,
        order: 1,
        createdAt: new Date('2026-06-03'),
      },
    ],
    briefings: [
      {
        id: 'briefing-1',
        clientId: client.id,
        projectId: 'project-1',
        title: 'Briefing inicial',
        description: 'Perguntas iniciais',
        status: 'SENT',
        responses: [{ id: 'response-1', submittedAt: new Date('2026-06-04') }],
        createdAt: new Date('2026-06-03'),
      },
    ],
    approvals: [
      {
        id: 'approval-1',
        clientId: client.id,
        projectId: 'project-1',
        title: 'Aprovacao da home',
        message: 'Validar home',
        status: ApprovalStatus.WAITING_CLIENT,
        preview: null,
        createdAt: new Date('2026-06-05'),
      },
    ],
    previews: [
      {
        id: 'preview-1',
        clientId: client.id,
        projectId: 'project-1',
        title: 'Preview v1',
        url: 'https://preview.ateliux.test',
        status: 'IN_APPROVAL',
        approvals: [],
        createdAt: new Date('2026-06-05'),
      },
    ],
    files: [
      {
        id: 'file-1',
        clientId: client.id,
        projectId: 'project-1',
        uploadedById: 'user-client-1',
        uploadedByType: FileUploadedByType.CLIENT,
        originalName: 'briefing.pdf',
        safeName: 'briefing.pdf',
        name: 'briefing.pdf',
        extension: '.pdf',
        mimeType: 'application/pdf',
        size: 1200,
        storageProvider: 'cloudinary',
        storageKey: 'ateliux/test/briefing',
        url: 'https://res.cloudinary.com/test/briefing.pdf',
        origin: FileOrigin.CLIENT,
        context: FileContext.CLIENT_FILE,
        visibility: FileVisibility.CLIENT_VISIBLE,
        status: FileStatus.PENDING_REVIEW,
        riskLevel: FileRiskLevel.SAFE_PREVIEW,
        downloadMode: FileDownloadMode.INLINE_ALLOWED,
        deletedAt: null,
        createdAt: new Date('2026-06-06'),
      },
    ],
    scheduleEvents: [
      {
        id: 'schedule-1',
        clientId: client.id,
        projectId: 'project-1',
        title: 'Entrega',
        date: new Date('2026-09-01'),
        visibility: 'VISIBLE_TO_CLIENT',
        createdAt: new Date('2026-06-07'),
      },
    ],
    financeRecords: [
      {
        id: 'finance-1',
        clientId: client.id,
        projectId: 'project-1',
        description: 'Parcela inicial',
        amount: 1200,
        dueDate: new Date('2026-08-10'),
        status: FinanceStatus.PENDING,
        visibleToClient: true,
        receiptFile: null,
        createdAt: new Date('2026-06-08'),
      },
    ],
    auditLogs: [
      {
        id: 'audit-1',
        actorId: 'admin-1',
        actorType: 'admin',
        action: 'PROJECT_CREATED_FULL_SETUP',
        entityType: 'Project',
        entityId: 'project-1',
        clientId: client.id,
        projectId: 'project-1',
        metadata: { title: 'Projeto criado', description: 'Projeto criado pela equipe.' },
        createdAt: new Date('2026-06-01'),
      },
    ],
    clientRequests: [
      {
        id: 'request-1',
        clientId: client.id,
        projectId: 'project-1',
        title: 'Ajustar banner',
        description: 'Trocar imagem',
        status: RequestStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        attachments: [],
        createdAt: new Date('2026-06-09'),
      },
    ],
    inboxConversations: [
      {
        id: 'inbox-1',
        clientId: client.id,
        projectId: 'project-1',
        subject: 'Ajuste no banner',
        status: 'OPEN',
        priority: Priority.HIGH,
        messages: [],
        assignee: manager,
        createdAt: new Date('2026-06-09'),
        updatedAt: new Date('2026-06-10'),
      },
    ],
  };

  const prisma: Record<string, unknown> = {
    client: {
      findUnique: async ({ where }: { where: { id: string } }) => (where.id === client.id ? client : null),
      update: async ({ data }: { data: { responsibleId?: string } }) => {
        calls.clientUpdates.push(data);
        return { ...client, ...data };
      },
    },
    adminUser: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (where.id === manager.id) return manager;
        if (where.id === designer.id) return designer;
        return null;
      },
      findMany: async ({ where }: { where: { id: { in: string[] } } }) =>
        [manager, designer].filter((item) => where.id.in.includes(item.id)),
    },
    project: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const project = { id: 'project-1', ...data };
        calls.projects.push(project);
        return project;
      },
      findMany: async ({ where }: { where: { clientId?: string; visibleToClient?: boolean } }) => {
        if (where.clientId && where.clientId !== client.id) return [];
        if (where.visibleToClient && storedProject.visibleToClient !== true) return [];
        return [storedProject];
      },
      findFirst: async ({ where }: { where: { id?: string; clientId?: string; visibleToClient?: boolean } }) => {
        if (where.id && where.id !== storedProject.id) return null;
        if (where.clientId && where.clientId !== client.id) return null;
        if (where.visibleToClient && storedProject.visibleToClient !== true) return null;
        return storedProject;
      },
      findUnique: async ({ where }: { where: { id: string } }) => (where.id === storedProject.id ? storedProject : null),
      findUniqueOrThrow: async () => ({
        id: 'project-1',
        client,
        manager,
        teamMembers: [{ adminUser: designer }],
        stages: calls.stages,
        briefings: calls.briefings,
        scheduleEvents: calls.schedule,
        financeRecords: calls.finance,
      }),
      update: async ({ data }: { data: Record<string, unknown> }) => {
        const cleanData = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
        const nextManager = data.managerId === designer.id ? designer : manager;
        storedProject = {
          ...storedProject,
          ...cleanData,
          managerId: data.managerId ?? storedProject.managerId,
          manager: data.managerId ? nextManager : storedProject.manager,
        };
        client.projects = [
          {
            id: storedProject.id,
            name: storedProject.name,
            status: storedProject.status,
            progress: storedProject.progress,
            visibleToClient: storedProject.visibleToClient,
            updatedAt: storedProject.updatedAt,
          },
        ];
        calls.projects.push(storedProject);
        return storedProject;
      },
    },
    projectTeamMember: {
      createMany: async ({ data }: { data: unknown[] }) => {
        calls.team.push(...data);
        return { count: data.length };
      },
      deleteMany: async () => {
        calls.team.length = 0;
        return { count: 1 };
      },
    },
    projectStage: {
      createMany: async ({ data }: { data: unknown[] }) => {
        calls.stages.push(...data);
        return { count: data.length };
      },
    },
    briefing: {
      create: async ({ data }: { data: unknown }) => {
        calls.briefings.push(data);
        return data;
      },
    },
    scheduleEvent: {
      createMany: async ({ data }: { data: unknown[] }) => {
        calls.schedule.push(...data);
        return { count: data.length };
      },
    },
    financeRecord: {
      create: async ({ data }: { data: unknown }) => {
        calls.finance.push(data);
        return data;
      },
    },
    auditLog: {
      create: async ({ data }: { data: unknown }) => {
        calls.history.push(data);
        return data;
      },
      createMany: async ({ data }: { data: unknown[] }) => {
        calls.history.push(...data);
        return { count: data.length };
      },
    },
    notification: {
      create: async ({ data }: { data: unknown }) => {
        calls.notifications.push(data);
        return data;
      },
    },
    $transaction: async <T>(callback: (tx: typeof prisma) => Promise<T>) => callback(prisma),
  };

  return { prisma, calls };
}

const adminUser = {
  id: 'user-admin-1',
  email: 'admin@ateliux.test',
  role: UserRole.ADMIN,
  adminRole: AdminRole.PROJECT_MANAGER,
  adminUserId: 'admin-1',
};

describe('ProjectsService full setup', () => {
  it('bloqueia o endpoint legado de criacao simples', () => {
    const controller = new ProjectsController({} as never);

    assert.throws(() => controller.create(), /substituido por \/admin\/projects\/full-setup/);
  });

  it('cria projeto completo com responsavel, etapa, briefing, cronograma, financeiro, historico e notificacao', async () => {
    const { prisma, calls } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    const project = await service.createFullSetup(adminUser, {
      clientId: 'client-1',
      name: 'Portal do Cliente',
      type: 'SaaS',
      scope: 'Portal, auth e dashboards',
      description: 'Projeto completo',
      status: ProjectStatus.ACTIVE,
      priority: Priority.MEDIUM,
      managerId: 'admin-1',
      teamIds: ['admin-2'],
      deadline: '2026-08-01',
      visibleToClient: true,
      currentStage: 'Planejamento',
      progress: 10,
      clientFacingSummary: 'Resumo para o cliente',
      initialBriefing: {
        title: 'Briefing inicial',
        description: 'Perguntas e objetivos iniciais.',
      },
      initialStages: [
        {
          title: 'Planejamento',
          description: 'Organizar escopo.',
          visibleToClient: true,
        },
      ],
      initialScheduleEvents: [
        {
          title: 'Kickoff',
          type: 'meeting',
          date: '2026-07-01',
          visibleToClient: true,
        },
      ],
      initialFinance: {
        description: 'Parcela inicial',
        amount: 1200,
        dueDate: '2026-07-10',
      },
    });

    assert.equal(project.id, 'project-1');
    assert.equal((calls.projects[0] as { managerId?: string }).managerId, 'admin-1');
    assert.equal(calls.team.length, 1);
    assert.equal(calls.stages.length, 1);
    assert.equal(calls.briefings.length, 1);
    assert.equal(calls.schedule.length, 1);
    assert.equal(calls.finance.length, 1);
    assert.equal(calls.history.length, 1);
    assert.equal(calls.notifications.length, 1);
  });

  it('falha ao criar projeto sem responsavel valido', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    await assert.rejects(
      () =>
        service.createFullSetup(adminUser, {
          clientId: 'client-1',
          name: 'Projeto sem responsavel',
          type: 'Site',
          scope: 'Escopo',
          description: 'Escopo do projeto',
          status: ProjectStatus.ACTIVE,
          priority: Priority.MEDIUM,
          managerId: 'admin-inexistente',
          deadline: '2026-08-01',
          visibleToClient: true,
          currentStage: 'Planejamento',
          progress: 0,
        }),
      /Project manager is required/,
    );
  });

  it('bloqueia criacao visivel incompleta pelo service legado', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    await assert.rejects(
      () =>
        service.create({
          clientId: 'client-1',
          name: 'Projeto incompleto',
          type: 'Site',
          scope: 'Escopo',
          managerId: 'admin-1',
          visibleToClient: true,
          deadline: '2026-08-01',
          progress: 0,
        }),
      /etapa atual/,
    );
  });

  it('lista para o cliente apenas projeto visivel com responsavel vinculado', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    const projects = await service.findClientProjects({ ...adminUser, clientId: 'client-1' });

    assert.equal(projects.length, 1);
    assert.equal((projects[0] as { manager?: { user?: { name?: string } } }).manager?.user?.name, 'Lina Armand');
  });

  it('editar responsavel e progresso atualiza historico, responsavel do cliente e retorno do cliente', async () => {
    const { prisma, calls } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    await service.update(
      'project-1',
      {
        managerId: 'admin-2',
        teamIds: ['admin-1'],
        progress: 45,
        currentStage: 'Design aprovado',
        deadline: '2026-09-01',
        visibleToClient: true,
        scope: 'Escopo atualizado',
        clientFacingSummary: 'Resumo atualizado',
      },
      adminUser,
    );
    const project = await service.findClientProject({ ...adminUser, clientId: 'client-1' }, 'project-1');

    assert.equal((project as { managerId?: string }).managerId, 'admin-2');
    assert.equal((project as { progress?: number }).progress, 45);
    assert.deepEqual(calls.clientUpdates[calls.clientUpdates.length - 1], { responsibleId: 'admin-2' });
    assert.ok(calls.history.length >= 1);
  });

  it('ocultar projeto remove o item dos endpoints do cliente', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    await service.update('project-1', { visibleToClient: false }, adminUser);

    await assert.rejects(
      () => service.findClientProject({ ...adminUser, clientId: 'client-1' }, 'project-1'),
      /Project not found/,
    );
  });

  it('retorna overview administrativo completo do projeto', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    const overview = await service.findAdminOverview('project-1', adminUser);

    assert.equal(overview.project.id, 'project-1');
    assert.equal(overview.project.manager?.id, 'admin-1');
    assert.equal(overview.client.id, 'client-1');
    assert.equal(overview.client.responsible?.id, 'admin-1');
    assert.equal(overview.team.length, 2);
    assert.equal(overview.stages.length, 1);
    assert.equal(overview.briefings.length, 1);
    assert.equal(overview.files.length, 1);
    assert.equal(overview.approvals.length, 1);
    assert.equal(overview.previews.length, 1);
    assert.equal(overview.schedule.length, 1);
    assert.equal(overview.finance.length, 1);
    assert.equal(overview.history.length, 1);
    assert.equal(overview.requests.length, 1);
    assert.equal(overview.inbox.length, 1);
    assert.equal(overview.permissions.canEditProject, true);
    assert.equal(overview.permissions.canEditTeam, true);
  });

  it('retorna 404 quando o projeto do overview nao existe', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    await assert.rejects(() => service.findAdminOverview('project-missing', adminUser), /Project not found/);
  });

  it('mascara financeiro no overview para role sem permissao financeira', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    const overview = await service.findAdminOverview('project-1', {
      ...adminUser,
      adminRole: AdminRole.SUPPORT,
    });

    assert.equal(overview.finance.length, 0);
    assert.equal(overview.stats.pendingPayments, 0);
    assert.equal(overview.permissions.canViewFinance, false);
    assert.equal(overview.permissions.canEditFiles, true);
  });

  it('calcula stats do overview com base nos dados operacionais', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    const overview = await service.findAdminOverview('project-1', adminUser);

    assert.deepEqual(
      {
        pendingApprovals: overview.stats.pendingApprovals,
        pendingFiles: overview.stats.pendingFiles,
        openRequests: overview.stats.openRequests,
        upcomingEvents: overview.stats.upcomingEvents,
        pendingPayments: overview.stats.pendingPayments,
      },
      {
        pendingApprovals: 1,
        pendingFiles: 1,
        openRequests: 1,
        upcomingEvents: 1,
        pendingPayments: 1,
      },
    );
  });

  it('mantem dados do overview coerentes com o Portal do Cliente', async () => {
    const { prisma } = createPrismaMock();
    const service = new ProjectsService(prisma as never);

    const [overview, clientProject] = await Promise.all([
      service.findAdminOverview('project-1', adminUser),
      service.findClientProject({ ...adminUser, clientId: 'client-1' }, 'project-1'),
    ]);

    assert.equal(overview.project.id, (clientProject as { id?: string }).id);
    assert.equal(overview.project.progress, (clientProject as { progress?: number }).progress);
    assert.equal(overview.project.currentStage, (clientProject as { currentStage?: string }).currentStage);
    assert.equal(overview.project.visibleToClient, (clientProject as { visibleToClient?: boolean }).visibleToClient);
  });

  it('aplica roles corretas no endpoint de overview', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, ProjectsController.prototype.findAdminOverview) as AdminRole[];

    assert.ok(roles.includes(AdminRole.ADMIN));
    assert.ok(roles.includes(AdminRole.PROJECT_MANAGER));
    assert.ok(roles.includes(AdminRole.DESIGNER_DEV));
    assert.ok(roles.includes(AdminRole.SUPPORT));
    assert.ok(roles.includes(AdminRole.FINANCE));
    assert.equal(roles.includes(AdminRole.EDITOR), false);
    assert.equal(roles.includes(AdminRole.ATTENDANCE), false);
  });

  it('RolesGuard permite role autorizada e bloqueia role sem permissao no overview', () => {
    const guard = new RolesGuard(new Reflector());
    const authorizedContext = createOverviewExecutionContext({ ...adminUser, adminRole: AdminRole.SUPPORT });
    const forbiddenContext = createOverviewExecutionContext({ ...adminUser, adminRole: AdminRole.EDITOR });

    assert.equal(guard.canActivate(authorizedContext), true);
    assert.equal(guard.canActivate(forbiddenContext), false);
  });
});

function createOverviewExecutionContext(user: RequestUser) {
  return {
    getHandler: () => ProjectsController.prototype.findAdminOverview,
    getClass: () => ProjectsController,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as never;
}
