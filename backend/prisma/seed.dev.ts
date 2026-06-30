import { PrismaClient } from '@prisma/client';
import {
  AccountStatus,
  AdminRole,
  ApprovalStatus,
  BlogPostStatus,
  BriefingStatus,
  FileContext,
  FileOrigin,
  FileStatus,
  FileUploadedByType,
  FileVisibility,
  FinanceStatus,
  InboxChannel,
  InboxSource,
  NotificationAudience,
  Priority,
  ProjectStatus,
  StageStatus,
  UserRole,
  VisibilityStatus,
} from '@prisma/client';
import { hash } from 'bcryptjs';

function assertDemoSeedAllowed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed.dev.ts bloqueado em producao.');
  }

  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Defina ALLOW_DEMO_SEED=true para rodar seed demo.');
  }
}

assertDemoSeedAllowed();

const prisma = new PrismaClient();

async function upsertAdmin(email: string, name: string, role: AdminRole) {
  const passwordHash = await hash('Ateliux@123456', 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
    update: {
      name,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  const admin = await prisma.adminUser.upsert({
    where: { userId: user.id },
    create: { userId: user.id, role },
    update: { role },
  });

  return { user, admin };
}

async function upsertClient(name: string, company: string, email: string, plan: string) {
  const passwordHash = await hash('Cliente@123456', 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: UserRole.CLIENT,
      status: AccountStatus.ACTIVE,
    },
    update: {
      name,
      role: UserRole.CLIENT,
      status: AccountStatus.ACTIVE,
    },
  });

  const client = await prisma.client.upsert({
    where: { email },
    create: {
      name,
      company,
      email,
      plan,
      status: AccountStatus.ACTIVE,
    },
    update: {
      name,
      company,
      plan,
      status: AccountStatus.ACTIVE,
    },
  });

  await prisma.clientAccount.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      userId: user.id,
      inviteStatus: AccountStatus.ACTIVE,
      lastAccessAt: new Date(),
    },
    update: {
      inviteStatus: AccountStatus.ACTIVE,
      lastAccessAt: new Date(),
    },
  });

  return { user, client };
}

async function resetSeedClientData(clientIds: string[]) {
  const conversations = await prisma.inboxConversation.findMany({
    where: { clientId: { in: clientIds } },
    select: { id: true },
  });
  const conversationIds = conversations.map((conversation) => conversation.id);

  await prisma.auditLog.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.notification.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.financeRecord.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.scheduleEvent.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.approval.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.preview.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.briefingResponse.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.briefing.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.projectStage.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.clientRequest.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.supportTicket.deleteMany({ where: { clientId: { in: clientIds } } });
  await prisma.fileAsset.deleteMany({ where: { clientId: { in: clientIds } } });
  if (conversationIds.length) {
    await prisma.inboxMessage.deleteMany({ where: { conversationId: { in: conversationIds } } });
    await prisma.inboxConversation.deleteMany({ where: { id: { in: conversationIds } } });
  }
  await prisma.project.deleteMany({ where: { clientId: { in: clientIds } } });
}

async function main() {
  const admin = await upsertAdmin('admin@ateliux.com.br', 'Admin Ateliux', AdminRole.ADMIN);
  const projectManager = await upsertAdmin(
    'gestor@ateliux.com.br',
    'Lina Armand',
    AdminRole.PROJECT_MANAGER,
  );
  const support = await upsertAdmin('suporte@ateliux.com.br', 'Emily Tyler', AdminRole.SUPPORT);

  const marima = await upsertClient('Ana Carvalho', 'Marima', 'ana@marima.com', 'Profissional');
  const bananinha = await upsertClient(
    'Bruno Nogueira',
    'Bananinha Acai',
    'bruno@bananinha.com',
    'Essencial',
  );
  const demo = await upsertClient(
    'Marina Demo',
    'Ateliux Demo',
    'marina.demo@ateliux.com.br',
    'Enterprise',
  );

  await resetSeedClientData([marima.client.id, bananinha.client.id, demo.client.id]);

  const marimaProject = await prisma.project.create({
    data: {
      clientId: marima.client.id,
      managerId: projectManager.admin.id,
      name: 'E-commerce Marima',
      type: 'E-commerce',
      scope: 'Vitrine, checkout e portal de pedidos',
      status: ProjectStatus.ACTIVE,
      progress: 48,
      currentStage: 'Design das telas',
      visibleToClient: true,
      deadline: new Date('2026-07-05T12:00:00.000Z'),
    },
  });

  const bananinhaProject = await prisma.project.create({
    data: {
      clientId: bananinha.client.id,
      managerId: projectManager.admin.id,
      name: 'Site de pedidos',
      type: 'Cardapio digital',
      scope: 'Pedidos, cardapio e combos',
      status: ProjectStatus.ACTIVE,
      progress: 64,
      currentStage: 'Desenvolvimento',
      visibleToClient: true,
      deadline: new Date('2026-07-10T12:00:00.000Z'),
    },
  });

  const demoProject = await prisma.project.create({
    data: {
      clientId: demo.client.id,
      managerId: projectManager.admin.id,
      name: 'Portal Ateliux Demo',
      type: 'SaaS',
      scope: 'Dashboard, auth e portal do cliente',
      status: ProjectStatus.WAITING_CLIENT,
      progress: 35,
      currentStage: 'Briefing tecnico',
      visibleToClient: true,
      deadline: new Date('2026-08-01T12:00:00.000Z'),
    },
  });

  await prisma.projectStage.createMany({
    data: [
      {
        clientId: marima.client.id,
        projectId: marimaProject.id,
        title: 'Design da Home',
        description: 'Criacao das telas principais para aprovacao.',
        status: StageStatus.WAITING_APPROVAL,
        order: 1,
        requiresApproval: true,
      },
      {
        clientId: bananinha.client.id,
        projectId: bananinhaProject.id,
        title: 'Montador de pedidos',
        description: 'Implementacao do fluxo de cardapio e combos.',
        status: StageStatus.IN_PROGRESS,
        order: 1,
      },
      {
        clientId: demo.client.id,
        projectId: demoProject.id,
        title: 'Arquitetura inicial',
        description: 'Definicao dos modulos e permissoes.',
        status: StageStatus.SENT_TO_CLIENT,
        order: 1,
      },
    ],
  });

  const briefing = await prisma.briefing.create({
    data: {
      clientId: marima.client.id,
      projectId: marimaProject.id,
      title: 'Briefing inicial do e-commerce',
      type: 'Produto',
      description: 'Objetivos, referencias e fluxo principal da loja.',
      status: BriefingStatus.SENT,
      visibility: VisibilityStatus.VISIBLE_TO_CLIENT,
      sentAt: new Date(),
    },
  });

  await prisma.briefingResponse.create({
    data: {
      briefingId: briefing.id,
      clientId: marima.client.id,
      projectId: marimaProject.id,
      answers: {
        priority: 'Mobile e checkout simples',
        references: 'Marcas premium minimalistas',
      },
    },
  });

  const preview = await prisma.preview.create({
    data: {
      clientId: marima.client.id,
      projectId: marimaProject.id,
      title: 'Home Marima v1',
      url: 'https://preview.ateliux.dev/marima/home',
      version: 'v1',
      status: 'IN_APPROVAL',
      sentAt: new Date(),
    },
  });

  await prisma.approval.create({
    data: {
      clientId: marima.client.id,
      projectId: marimaProject.id,
      previewId: preview.id,
      title: 'Design da Home',
      type: 'Preview',
      message: 'Validar primeira versao da home.',
      status: ApprovalStatus.WAITING_CLIENT,
      sentAt: new Date(),
    },
  });

  const conversation = await prisma.inboxConversation.create({
    data: {
      clientId: marima.client.id,
      projectId: marimaProject.id,
      channel: InboxChannel.CLIENTS,
      source: InboxSource.REQUEST,
      subject: 'Trocar fotos do banner',
      preview: 'Cliente pediu nova imagem para a colecao.',
      priority: Priority.HIGH,
    },
  });

  await prisma.inboxMessage.create({
    data: {
      conversationId: conversation.id,
      senderId: marima.user.id,
      senderType: 'client',
      body: 'Precisamos trocar a imagem da colecao nova.',
    },
  });

  await prisma.clientRequest.create({
    data: {
      clientId: marima.client.id,
      projectId: marimaProject.id,
      inboxConversationId: conversation.id,
      title: 'Trocar fotos do banner',
      description: 'Usar a nova foto da colecao enviada no briefing.',
      category: 'Design',
      priority: Priority.HIGH,
    },
  });

  await prisma.fileAsset.createMany({
    data: [
      {
        clientId: marima.client.id,
        projectId: marimaProject.id,
        uploadedById: marima.user.id,
        uploadedByType: FileUploadedByType.CLIENT,
        originalName: 'briefing-marima.pdf',
        safeName: 'briefing-marima.pdf',
        name: 'briefing-marima.pdf',
        extension: '.pdf',
        mimeType: 'application/pdf',
        detectedMime: 'application/pdf',
        size: 1800000,
        storageProvider: 'cloudinary',
        storageKey: 'ateliux/marima/briefing-marima',
        cloudinaryPublicId: 'ateliux/marima/briefing-marima',
        secureUrl: 'https://res.cloudinary.com/demo/briefing-marima.pdf',
        url: 'https://res.cloudinary.com/demo/briefing-marima.pdf',
        origin: FileOrigin.CLIENT,
        context: FileContext.BRIEFING_ATTACHMENT,
        visibility: FileVisibility.CLIENT_VISIBLE,
        status: FileStatus.APPROVED,
      },
      {
        clientId: bananinha.client.id,
        projectId: bananinhaProject.id,
        uploadedById: bananinha.user.id,
        uploadedByType: FileUploadedByType.CLIENT,
        originalName: 'logo-bananinha.pdf',
        safeName: 'logo-bananinha.pdf',
        name: 'logo-bananinha.pdf',
        extension: '.pdf',
        mimeType: 'application/pdf',
        detectedMime: 'application/pdf',
        size: 4200000,
        storageProvider: 'cloudinary',
        storageKey: 'ateliux/bananinha/logo',
        cloudinaryPublicId: 'ateliux/bananinha/logo',
        secureUrl: 'https://res.cloudinary.com/demo/logo-bananinha.pdf',
        url: 'https://res.cloudinary.com/demo/logo-bananinha.pdf',
        origin: FileOrigin.CLIENT,
        context: FileContext.CLIENT_FILE,
        visibility: FileVisibility.CLIENT_VISIBLE,
        status: FileStatus.PENDING_REVIEW,
      },
    ],
  });

  await prisma.scheduleEvent.create({
    data: {
      clientId: marima.client.id,
      projectId: marimaProject.id,
      title: 'Entrega da Home',
      type: 'Entrega',
      date: new Date('2026-07-05T15:00:00.000Z'),
      time: '15:00',
      responsible: 'Lina Armand',
      visibility: VisibilityStatus.VISIBLE_TO_CLIENT,
      notes: 'Aguardando aprovacao do preview.',
    },
  });

  await prisma.financeRecord.create({
    data: {
      clientId: bananinha.client.id,
      projectId: bananinhaProject.id,
      description: 'Parcela inicial do site de pedidos',
      amount: 1490,
      dueDate: new Date('2026-07-25T12:00:00.000Z'),
      status: FinanceStatus.PENDING,
      installment: '1/2',
      visibleToClient: true,
    },
  });

  const category = await prisma.blogCategory.upsert({
    where: { slug: 'produto' },
    create: { name: 'Produto', slug: 'produto' },
    update: { name: 'Produto' },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'como-transformar-ideia-em-produto-digital' },
    create: {
      categoryId: category.id,
      authorId: admin.admin.id,
      title: 'Como transformar uma ideia em produto digital',
      slug: 'como-transformar-ideia-em-produto-digital',
      excerpt: 'Um guia sobre estrategia, design e tecnologia para produtos digitais reais.',
      content: 'A criacao de um produto digital comeca pela clareza do problema e evolui para uma arquitetura sustentavel.',
      status: BlogPostStatus.PUBLISHED,
      readTime: '6 min',
      publishedAt: new Date(),
    },
    update: {
      status: BlogPostStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  await prisma.newsletterSubscriber.upsert({
    where: { email: 'contato@marima.com' },
    create: {
      email: 'contato@marima.com',
      name: 'Marima',
      origin: 'Blog',
      interests: ['E-commerce', 'Design'],
    },
    update: {
      name: 'Marima',
      origin: 'Blog',
      interests: ['E-commerce', 'Design'],
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: marima.user.id,
      audience: NotificationAudience.CLIENT,
      clientId: marima.client.id,
      projectId: marimaProject.id,
      type: 'approval.requested',
      title: 'Aprovacao solicitada',
      body: 'A Home Marima v1 esta aguardando sua revisao.',
      entityType: 'Approval',
      entityId: preview.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.admin.id,
      actorType: 'admin',
      action: 'seed.created',
      entityType: 'System',
      metadata: {
        message: 'Seed inicial Ateliux executado.',
        clients: 3,
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: support.admin.id,
      actorType: 'admin',
      action: 'support.ready',
      entityType: 'InboxConversation',
      entityId: conversation.id,
      clientId: marima.client.id,
      projectId: marimaProject.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
