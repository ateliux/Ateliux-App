import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

type Finding = {
  check: string;
  count: number;
};

const demoEmails = ['ana@marima.com', 'bruno@bananinha.com', 'marina.demo@ateliux.com.br'];
const demoCompanies = ['Marima', 'Bananinha Acai', 'Ateliux Demo'];
const demoProjectNames = ['E-commerce Marima', 'Site de pedidos', 'Portal Ateliux Demo'];
const demoPasswords = ['Ateliux@123456', 'Cliente@123456'];

function addFinding(findings: Finding[], check: string, count: number) {
  if (count > 0) {
    findings.push({ check, count });
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

  addFinding(findings, 'usuarios demo conhecidos', demoUsers);
  addFinding(findings, 'clientes demo conhecidos', demoClients);
  addFinding(findings, 'projetos demo conhecidos', demoProjects);
  addFinding(findings, 'previews demo conhecidos', demoPreviews);
  addFinding(findings, 'arquivos ou URLs Cloudinary demo', demoFiles);
  addFinding(findings, 'post de blog demo', demoBlogPosts);
  addFinding(findings, 'assinantes newsletter demo', demoNewsletterSubscribers);
  addFinding(findings, 'financeiro demo', demoFinanceRecords);
  addFinding(findings, 'cronograma demo', demoScheduleEvents);
  addFinding(findings, 'notificacoes demo', demoNotifications);
  addFinding(findings, 'audit logs demo', demoAuditLogs);
  addFinding(findings, 'usuarios com senha demo padrao', defaultPasswordMatches);

  if (!findings.length) {
    console.log('Production clean check passed. Nenhum dado demo conhecido encontrado.');
    return;
  }

  console.error('Production clean check failed. Dados demo conhecidos encontrados:');
  for (const finding of findings) {
    console.error(`- ${finding.check}: ${finding.count}`);
  }
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
