import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  uploadMaxGlobalSizeMb: Number(process.env.UPLOAD_MAX_GLOBAL_SIZE_MB ?? 20),
  uploadAutoApproveAdminSafeContexts:
    (process.env.UPLOAD_AUTO_APPROVE_ADMIN_SAFE_CONTEXTS ?? 'true') === 'true',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3002')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}));
