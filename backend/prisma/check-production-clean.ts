import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

type Finding = {
  check: string;
  table: string;
  count: number;
  reason: string;
  suggestion: string;
};

const demoEmails = ['ana@marima.com', 'bruno@bananinha.com', 'marina.demo@ateliux.com.br'];
const demoCompanies = ['Marima', 'Bananinha Acai', 'Ateliux Demo'];
const demoProjectNames = ['E-commerce Marima', 'Site de pedidos', 'Portal Ateliux Demo'];
const demoPasswords = ['Ateliux@123456', 'Cliente@123456'];

function addFinding(findings: Finding[], check: string, table: string, count: number, reason: string, suggestion: string) {
  if (count > 0) {
    findings.push({ check, table, count, reason, suggestion });
  }
}

async function countDefaultPasswordMatches() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      passwordHash: true,
    },
  });

  let matches = 0;

  for (const user of users) {
    for (const demoPassword of demoPasswords) {
      if (await compare(demoPassword, user.passwordHash)) {
        matches += 1;
        break;
      }
    }
  }

  return matches;
}

async function checkProductionClean() {
  const findings: Finding[] = [];

  const [
    demoUsers,
    demoClients,
    demoProjects,
    demoPreviews,
    demoFiles,
    demoBlogPosts,
    demoNewsletterSubscribers,
    demoFinanceRecords,
    demoScheduleEvents,
    demoNotifications,
    demoAuditLogs,
    defaultPasswordMatches,
  ] = await Promise.all([
    prisma.user.count({ where: { email: { in: demoEmails } } }),
    prisma.client.count({
      where: {
        OR: [
          { email: { in: demoEmails } },
          { name: { in: ['Ana Carvalho', 'Bruno Nogueira', 'Marina Demo'] } },
          { company: { in: demoCompanies } },
        ],
      },
    }),
    prisma.project.count({ where: { name: { in: demoProjectNames } } }),
    prisma.preview.count({ where: { url: { contains: 'preview.ateliux.dev' } } }),
    prisma.fileAsset.count({
      where: {
        OR: [
          { url: { contains: 'res.cloudinary.com/demo' } },
          { secureUrl: { contains: 'res.cloudinary.com/demo' } },
          { cloudinaryPublicId: { contains: 'ateliux/marima' } },
          { cloudinaryPublicId: { contains: 'ateliux/bananinha' } },
        ],
      },
    }),
    prisma.blogPost.count({ where: { slug: 'como-transformar-ideia-em-produto-digital' } }),
    prisma.newsletterSubscriber.count({ where: { email: 'contato@marima.com' } }),
    prisma.financeRecord.count({
      where: { description: { contains: 'Parcela inicial do site de pedidos' } },
    }),
    prisma.scheduleEvent.count({ where: { title: 'Entrega da Home' } }),
    prisma.notification.count({ where: { body: { contains: 'Home Marima v1' } } }),
    prisma.auditLog.count({ where: { action: { in: ['seed.created', 'support.ready'] } } }),
    countDefaultPasswordMatches(),
  ]);

  addFinding(findings, 'usuarios demo conhecidos', 'User', demoUsers, 'emails do seed demo local encontrados', 'usar banco limpo ou production:clean-demo-data em ambiente controlado');
  addFinding(findings, 'clientes demo conhecidos', 'Client', demoClients, 'clientes/empresas do seed demo local encontrados', 'usar banco limpo ou production:clean-demo-data em ambiente controlado');
  addFinding(findings, 'projetos demo conhecidos', 'Project', demoProjects, 'projetos do seed demo local encontrados', 'usar banco limpo ou production:clean-demo-data em ambiente controlado');
  addFinding(findings, 'previews demo conhecidos', 'Preview', demoPreviews, 'URL de preview demo encontrada', 'remover dados demo antes de producao');
  addFinding(findings, 'arquivos ou URLs Cloudinary demo', 'FileAsset', demoFiles, 'URLs/publicIds demo encontrados', 'remover registros demo; Cloudinary fisico exige confirmacao separada');
  addFinding(findings, 'post de blog demo', 'BlogPost', demoBlogPosts, 'post do seed demo local encontrado', 'remover ou substituir por conteudo real');
  addFinding(findings, 'assinantes newsletter demo', 'NewsletterSubscriber', demoNewsletterSubscribers, 'assinante demo do seed encontrado', 'remover dados demo');
  addFinding(findings, 'financeiro demo', 'FinanceRecord', demoFinanceRecords, 'cobranca demo encontrada', 'remover dados demo');
  addFinding(findings, 'cronograma demo', 'ScheduleEvent', demoScheduleEvents, 'evento demo encontrado', 'remover dados demo');
  addFinding(findings, 'notificacoes demo', 'Notification', demoNotifications, 'notificacao demo encontrada', 'remover dados demo');
  addFinding(findings, 'audit logs demo', 'AuditLog', demoAuditLogs, 'logs gerados pelo seed demo encontrados', 'remover dados demo em ambiente controlado');
  addFinding(findings, 'usuarios com senha demo padrao', 'User', defaultPasswordMatches, 'hash confere com senha demo conhecida', 'trocar senha real ou remover usuario demo');

  if (!findings.length) {
    console.log('Production clean check passed. Nenhum dado demo conhecido encontrado.');
    return;
  }

  console.error('Production clean check failed. Dados demo conhecidos encontrados:');
  for (const finding of findings) {
    console.error(`- ${finding.check}: ${finding.count}`);
    console.error(`  tabela: ${finding.table}`);
    console.error(`  motivo: ${finding.reason}`);
    console.error(`  acao sugerida: ${finding.suggestion}`);
  }
  console.error('A validacao foi bloqueada corretamente. Use banco limpo ou rode production:clean-demo-data primeiro em dry-run.');
  process.exitCode = 1;
}

checkProductionClean()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
