import { Prisma, PrismaClient } from '@prisma/client';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

type CleanupMode = 'dry-run' | 'apply';

type CleanupPlan = {
  mode: CleanupMode;
  databaseHost: string;
  databaseName: string;
  environment: string;
  demoClientIds: string[];
  demoClientUserIds: string[];
  demoAdminUserIds: string[];
  protectedAdminUserIds: string[];
  demoProjectIds: string[];
  demoConversationIds: string[];
  demoInboxMessageIds: string[];
  demoClientRequestIds: string[];
  demoSupportTicketIds: string[];
  demoFileAssetIds: string[];
  demoPreviewIds: string[];
  demoBriefingIds: string[];
  demoBlogPostIds: string[];
  demoNewsletterIds: string[];
  demoFinanceIds: string[];
  demoScheduleIds: string[];
  demoNotificationIds: string[];
  demoAuditLogIds: string[];
  ignored: string[];
};

type CleanupResult = {
  table: string;
  planned: number;
  removed: number;
  notes?: string;
};

const prisma = new PrismaClient();
const cwd = process.cwd();
const rootDir = existsSync(resolve(cwd, 'prisma', 'schema.prisma')) ? resolve(cwd, '..') : cwd;

const DEMO_CLIENT_EMAILS = ['ana@marima.com', 'bruno@bananinha.com', 'marina.demo@ateliux.com.br'];
const DEMO_CLIENT_NAMES = ['Ana Carvalho', 'Bruno Nogueira', 'Marina Demo'];
const DEMO_COMPANIES = ['Marima', 'Bananinha Acai', 'Ateliux Demo'];
const DEMO_PROJECT_NAMES = ['E-commerce Marima', 'Site de pedidos', 'Portal Ateliux Demo'];
const DEMO_ADMIN_EMAILS = ['admin@ateliux.com.br', 'gestor@ateliux.com.br', 'suporte@ateliux.com.br'];
const DEMO_BLOG_SLUGS = ['como-transformar-ideia-em-produto-digital'];
const DEMO_NEWSLETTER_EMAILS = ['contato@marima.com'];

function parseMode(): CleanupMode {
  const mode = process.env.CLEAN_DEMO_DATA_MODE?.trim() || 'dry-run';

  if (mode !== 'dry-run' && mode !== 'apply') {
    throw new Error('CLEAN_DEMO_DATA_MODE precisa ser dry-run ou apply.');
  }

  return mode;
}

function readDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL precisa estar definido para analisar limpeza demo.');
  }

  return databaseUrl;
}

function parseDatabaseInfo(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname || 'unknown',
      database: url.pathname.replace(/^\//, '') || 'unknown',
    };
  } catch {
    return {
      host: 'invalid-url',
      database: 'unknown',
    };
  }
}

function isLocalDatabaseHost(host: string) {
  return ['localhost', '127.0.0.1', '0.0.0.0', 'host.docker.internal'].includes(host);
}

function assertCleanupAllowed(mode: CleanupMode, databaseUrl: string) {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  const cleanupEnv = process.env.ALLOW_DEMO_CLEANUP_ENV?.toLowerCase();
  const { host, database } = parseDatabaseInfo(databaseUrl);

  if (nodeEnv === 'production') {
    throw new Error('Limpeza demo bloqueada quando NODE_ENV=production.');
  }

  if (mode === 'dry-run') {
    return;
  }

  if (process.env.ALLOW_DEMO_CLEANUP !== 'true') {
    throw new Error('ALLOW_DEMO_CLEANUP=true e obrigatorio para aplicar limpeza demo.');
  }

  if (process.env.CONFIRM_CLEAN_DEMO_DATA !== 'true') {
    throw new Error('CONFIRM_CLEAN_DEMO_DATA=true e obrigatorio para aplicar limpeza demo.');
  }

  if (cleanupEnv !== 'local' && cleanupEnv !== 'staging') {
    throw new Error('ALLOW_DEMO_CLEANUP_ENV precisa ser local ou staging para aplicar limpeza demo.');
  }

  if (!isLocalDatabaseHost(host) && cleanupEnv !== 'staging') {
    throw new Error('Banco nao local exige ALLOW_DEMO_CLEANUP_ENV=staging.');
  }

  if (/(^|[-_.])(prod|production)([-_.]|$)/i.test(`${host}.${database}`)) {
    throw new Error('Identificador do banco parece producao; limpeza demo apply bloqueada.');
  }
}

function uniq(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function relationIn(ids: string[]) {
  return ids.length ? { in: ids } : { in: ['__no_match__'] };
}

async function collectCleanupPlan(mode: CleanupMode, databaseUrl: string): Promise<CleanupPlan> {
  const { host, database } = parseDatabaseInfo(databaseUrl);

  const demoClients = await prisma.client.findMany({
    where: {
      OR: [
        { email: { in: DEMO_CLIENT_EMAILS } },
        { name: { in: DEMO_CLIENT_NAMES } },
        { company: { in: DEMO_COMPANIES } },
      ],
    },
    include: {
      account: true,
    },
  });

  const demoClientIds = demoClients.map((client) => client.id);
  const demoClientUserIds = uniq(demoClients.map((client) => client.account?.userId));

  const demoProjects = await prisma.project.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { name: { in: DEMO_PROJECT_NAMES } },
      ],
    },
    select: { id: true },
  });
  const demoProjectIds = demoProjects.map((project) => project.id);

  const demoConversations = await prisma.inboxConversation.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { subject: { in: ['Trocar fotos do banner'] } },
      ],
    },
    select: { id: true },
  });
  const demoConversationIds = demoConversations.map((conversation) => conversation.id);

  const demoInboxMessages = await prisma.inboxMessage.findMany({
    where: { conversationId: relationIn(demoConversationIds) },
    select: { id: true },
  });
  const demoInboxMessageIds = demoInboxMessages.map((message) => message.id);

  const demoClientRequests = await prisma.clientRequest.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { inboxConversationId: relationIn(demoConversationIds) },
        { title: 'Trocar fotos do banner' },
      ],
    },
    select: { id: true },
  });
  const demoClientRequestIds = demoClientRequests.map((request) => request.id);

  const demoSupportTickets = await prisma.supportTicket.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { inboxConversationId: relationIn(demoConversationIds) },
      ],
    },
    select: { id: true },
  });
  const demoSupportTicketIds = demoSupportTickets.map((ticket) => ticket.id);

  const demoFiles = await prisma.fileAsset.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { url: { contains: 'res.cloudinary.com/demo' } },
        { secureUrl: { contains: 'res.cloudinary.com/demo' } },
        { cloudinaryPublicId: { contains: 'ateliux/marima' } },
        { cloudinaryPublicId: { contains: 'ateliux/bananinha' } },
      ],
      NOT: [
        { originalName: { startsWith: 'E2E_' } },
        { name: { startsWith: 'E2E_' } },
        { safeName: { startsWith: 'E2E_' } },
      ],
    },
    select: { id: true },
  });
  const demoFileAssetIds = demoFiles.map((file) => file.id);

  const demoPreviews = await prisma.preview.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { url: { contains: 'preview.ateliux.dev' } },
      ],
    },
    select: { id: true },
  });
  const demoPreviewIds = demoPreviews.map((preview) => preview.id);

  const demoBriefings = await prisma.briefing.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { title: 'Briefing inicial do e-commerce' },
      ],
    },
    select: { id: true },
  });
  const demoBriefingIds = demoBriefings.map((briefing) => briefing.id);

  const demoBlogPosts = await prisma.blogPost.findMany({
    where: { slug: { in: DEMO_BLOG_SLUGS } },
    select: { id: true },
  });
  const demoBlogPostIds = demoBlogPosts.map((post) => post.id);

  const demoNewsletter = await prisma.newsletterSubscriber.findMany({
    where: { email: { in: DEMO_NEWSLETTER_EMAILS } },
    select: { id: true },
  });
  const demoNewsletterIds = demoNewsletter.map((subscriber) => subscriber.id);

  const demoFinance = await prisma.financeRecord.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { description: { contains: 'Parcela inicial do site de pedidos' } },
      ],
    },
    select: { id: true },
  });
  const demoFinanceIds = demoFinance.map((finance) => finance.id);

  const demoSchedule = await prisma.scheduleEvent.findMany({
    where: {
      OR: [
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { title: 'Entrega da Home' },
      ],
    },
    select: { id: true },
  });
  const demoScheduleIds = demoSchedule.map((schedule) => schedule.id);

  const demoNotifications = await prisma.notification.findMany({
    where: {
      OR: [
        { recipientId: relationIn(demoClientUserIds) },
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { body: { contains: 'Home Marima v1' } },
      ],
    },
    select: { id: true },
  });
  const demoNotificationIds = demoNotifications.map((notification) => notification.id);

  const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const demoAdminUsers = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      email: { in: DEMO_ADMIN_EMAILS },
      ...(bootstrapAdminEmail ? { NOT: { email: bootstrapAdminEmail } } : {}),
    },
    select: { id: true, email: true },
  });
  const protectedAdminUsers = bootstrapAdminEmail
    ? await prisma.user.findMany({
        where: {
          role: 'ADMIN',
          email: bootstrapAdminEmail,
        },
        select: { id: true },
      })
    : [];

  const allowAdminCleanup = process.env.ALLOW_DEMO_ADMIN_CLEANUP === 'true';
  const demoAdminUserIds = allowAdminCleanup ? demoAdminUsers.map((user) => user.id) : [];
  const ignored = [
    !allowAdminCleanup && demoAdminUsers.length
      ? `${demoAdminUsers.length} admin user(s) seed conhecidos ignorados; defina ALLOW_DEMO_ADMIN_CLEANUP=true para incluir, preservando BOOTSTRAP_ADMIN_EMAIL.`
      : null,
    protectedAdminUsers.length ? `${protectedAdminUsers.length} bootstrap admin protegido por BOOTSTRAP_ADMIN_EMAIL.` : null,
    'Dados E2E nao sao removidos por production:clean-demo-data.',
    'Assets fisicos do Cloudinary nao sao removidos por padrao.',
  ].filter(Boolean) as string[];

  const demoAuditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { action: { in: ['seed.created', 'support.ready'] } },
        { clientId: relationIn(demoClientIds) },
        { projectId: relationIn(demoProjectIds) },
        { actorId: relationIn([...demoClientUserIds, ...demoAdminUserIds]) },
        { entityId: relationIn([...demoProjectIds, ...demoConversationIds, ...demoPreviewIds]) },
      ],
    },
    select: { id: true },
  });

  return {
    mode,
    databaseHost: host,
    databaseName: database,
    environment: process.env.NODE_ENV || 'development',
    demoClientIds,
    demoClientUserIds,
    demoAdminUserIds,
    protectedAdminUserIds: protectedAdminUsers.map((user) => user.id),
    demoProjectIds,
    demoConversationIds,
    demoInboxMessageIds,
    demoClientRequestIds,
    demoSupportTicketIds,
    demoFileAssetIds,
    demoPreviewIds,
    demoBriefingIds,
    demoBlogPostIds,
    demoNewsletterIds,
    demoFinanceIds,
    demoScheduleIds,
    demoNotificationIds,
    demoAuditLogIds: demoAuditLogs.map((log) => log.id),
    ignored,
  };
}

function createPlannedResults(plan: CleanupPlan): CleanupResult[] {
  return [
    { table: 'AuditLog', planned: plan.demoAuditLogIds.length, removed: 0 },
    { table: 'Notification', planned: plan.demoNotificationIds.length, removed: 0 },
    { table: 'BlogShare', planned: plan.demoBlogPostIds.length, removed: 0, notes: 'por post demo' },
    { table: 'SavedBlogPost', planned: plan.demoBlogPostIds.length, removed: 0, notes: 'por post demo' },
    { table: 'BlogComment', planned: plan.demoBlogPostIds.length, removed: 0, notes: 'por post demo' },
    { table: 'BlogPost', planned: plan.demoBlogPostIds.length, removed: 0 },
    { table: 'NewsletterSubscriber', planned: plan.demoNewsletterIds.length, removed: 0 },
    { table: 'ClientRequestAttachment', planned: plan.demoClientRequestIds.length + plan.demoFileAssetIds.length, removed: 0 },
    { table: 'SupportTicketAttachment', planned: plan.demoSupportTicketIds.length + plan.demoFileAssetIds.length, removed: 0 },
    { table: 'InboxMessage', planned: plan.demoInboxMessageIds.length, removed: 0 },
    { table: 'ClientRequest', planned: plan.demoClientRequestIds.length, removed: 0 },
    { table: 'SupportTicket', planned: plan.demoSupportTicketIds.length, removed: 0 },
    { table: 'InboxConversation', planned: plan.demoConversationIds.length, removed: 0 },
    { table: 'Approval', planned: plan.demoClientIds.length + plan.demoProjectIds.length + plan.demoPreviewIds.length, removed: 0 },
    { table: 'Preview', planned: plan.demoPreviewIds.length, removed: 0 },
    { table: 'BriefingResponse', planned: plan.demoBriefingIds.length + plan.demoClientIds.length, removed: 0 },
    { table: 'Briefing', planned: plan.demoBriefingIds.length, removed: 0 },
    { table: 'ScheduleEvent', planned: plan.demoScheduleIds.length, removed: 0 },
    { table: 'FinanceRecord', planned: plan.demoFinanceIds.length, removed: 0 },
    { table: 'ProjectStage', planned: plan.demoProjectIds.length + plan.demoClientIds.length, removed: 0 },
    { table: 'ProjectTeamMember', planned: plan.demoProjectIds.length, removed: 0 },
    { table: 'FileAsset', planned: plan.demoFileAssetIds.length, removed: 0, notes: 'somente banco; Cloudinary fisico bloqueado' },
    { table: 'Project', planned: plan.demoProjectIds.length, removed: 0 },
    { table: 'Client', planned: plan.demoClientIds.length, removed: 0 },
    { table: 'User CLIENT', planned: plan.demoClientUserIds.length, removed: 0 },
    { table: 'User ADMIN seed', planned: plan.demoAdminUserIds.length, removed: 0, notes: 'exige ALLOW_DEMO_ADMIN_CLEANUP=true' },
  ];
}

async function executeCleanup(plan: CleanupPlan) {
  const results: CleanupResult[] = [];
  const push = (table: string, planned: number, removed: number, notes?: string) => {
    results.push({ table, planned, removed, notes });
  };

  await prisma.$transaction(
    async (tx) => {
      const audit = await tx.auditLog.deleteMany({ where: { id: relationIn(plan.demoAuditLogIds) } });
      push('AuditLog', plan.demoAuditLogIds.length, audit.count);

      const notifications = await tx.notification.deleteMany({ where: { id: relationIn(plan.demoNotificationIds) } });
      push('Notification', plan.demoNotificationIds.length, notifications.count);

      const blogShares = await tx.blogShare.deleteMany({ where: { postId: relationIn(plan.demoBlogPostIds) } });
      push('BlogShare', plan.demoBlogPostIds.length, blogShares.count, 'por post demo');

      const savedPosts = await tx.savedBlogPost.deleteMany({ where: { postId: relationIn(plan.demoBlogPostIds) } });
      push('SavedBlogPost', plan.demoBlogPostIds.length, savedPosts.count, 'por post demo');

      const comments = await tx.blogComment.deleteMany({ where: { postId: relationIn(plan.demoBlogPostIds) } });
      push('BlogComment', plan.demoBlogPostIds.length, comments.count, 'por post demo');

      const blogPosts = await tx.blogPost.deleteMany({ where: { id: relationIn(plan.demoBlogPostIds) } });
      push('BlogPost', plan.demoBlogPostIds.length, blogPosts.count);

      const newsletter = await tx.newsletterSubscriber.deleteMany({ where: { id: relationIn(plan.demoNewsletterIds) } });
      push('NewsletterSubscriber', plan.demoNewsletterIds.length, newsletter.count);

      const requestAttachments = await tx.clientRequestAttachment.deleteMany({
        where: {
          OR: [
            { clientRequestId: relationIn(plan.demoClientRequestIds) },
            { fileAssetId: relationIn(plan.demoFileAssetIds) },
          ],
        },
      });
      push('ClientRequestAttachment', plan.demoClientRequestIds.length + plan.demoFileAssetIds.length, requestAttachments.count);

      const supportAttachments = await tx.supportTicketAttachment.deleteMany({
        where: {
          OR: [
            { supportTicketId: relationIn(plan.demoSupportTicketIds) },
            { fileAssetId: relationIn(plan.demoFileAssetIds) },
          ],
        },
      });
      push('SupportTicketAttachment', plan.demoSupportTicketIds.length + plan.demoFileAssetIds.length, supportAttachments.count);

      await tx.financeRecord.updateMany({
        where: { receiptFileId: relationIn(plan.demoFileAssetIds) },
        data: { receiptFileId: null },
      });
      await tx.blogPost.updateMany({
        where: { coverFileId: relationIn(plan.demoFileAssetIds) },
        data: { coverFileId: null },
      });
      await tx.blogPost.updateMany({
        where: { heroImageFileId: relationIn(plan.demoFileAssetIds) },
        data: { heroImageFileId: null },
      });

      const messages = await tx.inboxMessage.deleteMany({ where: { id: relationIn(plan.demoInboxMessageIds) } });
      push('InboxMessage', plan.demoInboxMessageIds.length, messages.count);

      const clientRequests = await tx.clientRequest.deleteMany({ where: { id: relationIn(plan.demoClientRequestIds) } });
      push('ClientRequest', plan.demoClientRequestIds.length, clientRequests.count);

      const supportTickets = await tx.supportTicket.deleteMany({ where: { id: relationIn(plan.demoSupportTicketIds) } });
      push('SupportTicket', plan.demoSupportTicketIds.length, supportTickets.count);

      const conversations = await tx.inboxConversation.deleteMany({ where: { id: relationIn(plan.demoConversationIds) } });
      push('InboxConversation', plan.demoConversationIds.length, conversations.count);

      const approvals = await tx.approval.deleteMany({
        where: {
          OR: [
            { clientId: relationIn(plan.demoClientIds) },
            { projectId: relationIn(plan.demoProjectIds) },
            { previewId: relationIn(plan.demoPreviewIds) },
          ],
        },
      });
      push('Approval', plan.demoClientIds.length + plan.demoProjectIds.length + plan.demoPreviewIds.length, approvals.count);

      const previews = await tx.preview.deleteMany({ where: { id: relationIn(plan.demoPreviewIds) } });
      push('Preview', plan.demoPreviewIds.length, previews.count);

      const briefingResponses = await tx.briefingResponse.deleteMany({
        where: {
          OR: [
            { briefingId: relationIn(plan.demoBriefingIds) },
            { clientId: relationIn(plan.demoClientIds) },
            { projectId: relationIn(plan.demoProjectIds) },
          ],
        },
      });
      push('BriefingResponse', plan.demoBriefingIds.length + plan.demoClientIds.length, briefingResponses.count);

      const briefings = await tx.briefing.deleteMany({ where: { id: relationIn(plan.demoBriefingIds) } });
      push('Briefing', plan.demoBriefingIds.length, briefings.count);

      const schedule = await tx.scheduleEvent.deleteMany({ where: { id: relationIn(plan.demoScheduleIds) } });
      push('ScheduleEvent', plan.demoScheduleIds.length, schedule.count);

      const finance = await tx.financeRecord.deleteMany({ where: { id: relationIn(plan.demoFinanceIds) } });
      push('FinanceRecord', plan.demoFinanceIds.length, finance.count);

      const stages = await tx.projectStage.deleteMany({
        where: {
          OR: [
            { projectId: relationIn(plan.demoProjectIds) },
            { clientId: relationIn(plan.demoClientIds) },
          ],
        },
      });
      push('ProjectStage', plan.demoProjectIds.length + plan.demoClientIds.length, stages.count);

      const team = await tx.projectTeamMember.deleteMany({ where: { projectId: relationIn(plan.demoProjectIds) } });
      push('ProjectTeamMember', plan.demoProjectIds.length, team.count);

      const files = await tx.fileAsset.deleteMany({ where: { id: relationIn(plan.demoFileAssetIds) } });
      push('FileAsset', plan.demoFileAssetIds.length, files.count, 'somente banco; Cloudinary fisico bloqueado');

      const projects = await tx.project.deleteMany({ where: { id: relationIn(plan.demoProjectIds) } });
      push('Project', plan.demoProjectIds.length, projects.count);

      const clients = await tx.client.deleteMany({ where: { id: relationIn(plan.demoClientIds) } });
      push('Client', plan.demoClientIds.length, clients.count);

      const clientUsers = await tx.user.deleteMany({
        where: {
          id: relationIn(plan.demoClientUserIds),
          role: 'CLIENT',
        },
      });
      push('User CLIENT', plan.demoClientUserIds.length, clientUsers.count);

      const adminUsers = await tx.user.deleteMany({
        where: {
          id: relationIn(plan.demoAdminUserIds),
          role: 'ADMIN',
        },
      });
      push('User ADMIN seed', plan.demoAdminUserIds.length, adminUsers.count, 'exige ALLOW_DEMO_ADMIN_CLEANUP=true');
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      timeout: 30_000,
    },
  );

  return results;
}

function maskValue(value: string) {
  if (!value || value === 'unknown') return value;
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

function formatResults(plan: CleanupPlan, results: CleanupResult[], blockedReason?: string) {
  const totalPlanned = results.reduce((sum, result) => sum + result.planned, 0);
  const totalRemoved = results.reduce((sum, result) => sum + result.removed, 0);
  const lines = [
    '# Ateliux Demo Cleanup Report',
    '',
    `- Date: ${new Date().toISOString()}`,
    `- Mode: ${plan.mode}`,
    `- Environment: ${plan.environment}`,
    `- Database host: ${maskValue(plan.databaseHost)}`,
    `- Database name: ${maskValue(plan.databaseName)}`,
    `- Result: ${blockedReason ? 'blocked' : plan.mode === 'apply' ? 'applied' : 'dry-run'}`,
    `- Total planned markers: ${totalPlanned}`,
    `- Total removed rows: ${totalRemoved}`,
    '',
    '## Tables',
    '',
    '| Table | Planned markers | Removed rows | Notes |',
    '| --- | ---: | ---: | --- |',
    ...results.map((result) => `| ${result.table} | ${result.planned} | ${result.removed} | ${result.notes ?? ''} |`),
    '',
    '## Ignored',
    '',
    ...(plan.ignored.length ? plan.ignored.map((item) => `- ${item}`) : ['- None.']),
    '',
    '## Blocked Reason',
    '',
    blockedReason ? `- ${blockedReason}` : '- None.',
    '',
    '## Next Action',
    '',
    plan.mode === 'dry-run'
      ? '- Dry-run nao alterou o banco. Para aplicar em ambiente controlado, defina CONFIRM_CLEAN_DEMO_DATA=true, ALLOW_DEMO_CLEANUP=true, ALLOW_DEMO_CLEANUP_ENV=local|staging e CLEAN_DEMO_DATA_MODE=apply.'
      : '- Rode npm run production:check-clean e depois npm run validate:pre-production.',
    '',
    '## Safety Notes',
    '',
    '- production:clean-demo-data nao apaga Cloudinary fisico.',
    '- Dados E2E nao sao removidos por este script.',
    '- BOOTSTRAP_ADMIN_EMAIL e protegido quando definido.',
    '- Nenhum valor completo de DATABASE_URL ou secret e gravado neste relatorio.',
  ];

  return `${lines.join('\n')}\n`;
}

function writeReport(content: string) {
  const reportPath = resolve(rootDir, 'docs', 'reports', 'demo-cleanup-latest.md');
  const reportDir = dirname(reportPath);

  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }

  writeFileSync(reportPath, content, 'utf8');
  console.log(`Relatorio de limpeza demo salvo em ${reportPath}`);
}

async function main() {
  const mode = parseMode();
  const databaseUrl = readDatabaseUrl();
  let blockedReason: string | undefined;

  try {
    assertCleanupAllowed(mode, databaseUrl);
  } catch (error) {
    blockedReason = error instanceof Error ? error.message : String(error);
    const plan = await collectCleanupPlan('dry-run', databaseUrl);
    const planned = createPlannedResults(plan);
    writeReport(formatResults(plan, planned, blockedReason));
    throw error;
  }

  const plan = await collectCleanupPlan(mode, databaseUrl);
  const results = mode === 'apply' ? await executeCleanup(plan) : createPlannedResults(plan);

  writeReport(formatResults(plan, results));

  console.log(mode === 'apply' ? 'Limpeza demo aplicada.' : 'DRY RUN: nenhuma alteracao foi feita.');
  for (const result of results) {
    console.log(`- ${result.table}: planned=${result.planned} removed=${result.removed}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
