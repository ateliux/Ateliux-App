import { AccountStatus, AdminRole, PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { existsSync, readFileSync } from 'node:fs';

const prisma = new PrismaClient();

const FORBIDDEN_PASSWORDS = new Set(['Ateliux@123456', 'Cliente@123456']);

function loadEnvFile() {
  const envPath = process.env.BOOTSTRAP_ENV_FILE || '.env';
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} precisa estar definido para executar o bootstrap admin.`);
  }

  return value;
}

function assertEmail(value: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(value)) {
    throw new Error('BOOTSTRAP_ADMIN_EMAIL precisa ser um e-mail valido.');
  }
}

function assertStrongPassword(value: string) {
  const failures = [
    value.length < 12 ? '12+ caracteres' : null,
    !/[A-Z]/.test(value) ? 'letra maiuscula' : null,
    !/[a-z]/.test(value) ? 'letra minuscula' : null,
    !/[0-9]/.test(value) ? 'numero' : null,
    !/[^A-Za-z0-9]/.test(value) ? 'simbolo' : null,
  ].filter(Boolean);

  if (FORBIDDEN_PASSWORDS.has(value)) {
    failures.push('senha demo proibida');
  }

  if (failures.length) {
    throw new Error(`BOOTSTRAP_ADMIN_PASSWORD fraca ou invalida: ${failures.join(', ')}.`);
  }
}

async function bootstrapAdmin() {
  const email = readRequiredEnv('BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
  const name = readRequiredEnv('BOOTSTRAP_ADMIN_NAME');
  const password = readRequiredEnv('BOOTSTRAP_ADMIN_PASSWORD');
  const resetPassword = process.env.BOOTSTRAP_ADMIN_RESET_PASSWORD === 'true';

  assertEmail(email);
  assertStrongPassword(password);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  const shouldSetPassword = !existingUser || resetPassword;
  const passwordHash = shouldSetPassword ? await hash(password, 12) : undefined;

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          role: UserRole.ADMIN,
          status: AccountStatus.ACTIVE,
          ...(passwordHash ? { passwordHash } : {}),
        },
      })
    : await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: passwordHash as string,
          role: UserRole.ADMIN,
          status: AccountStatus.ACTIVE,
        },
      });

  await prisma.adminUser.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      role: AdminRole.ADMIN,
    },
    update: {
      role: AdminRole.ADMIN,
    },
  });

  console.log(`Bootstrap admin concluido. created=${existingUser ? 'false' : 'true'} passwordUpdated=${shouldSetPassword ? 'true' : 'false'}`);
}

bootstrapAdmin()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
