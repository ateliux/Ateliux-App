import { z } from 'zod';

const booleanString = z
  .string()
  .transform((value) => value === 'true')
  .or(z.boolean());

const optionalSecret = z.string().optional().default('');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().default('api'),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: booleanString.default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  CLIENT_APP_URL: z.string().url(),
  ADMIN_APP_URL: z.string().url(),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3002'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: optionalSecret,
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanString.default(false),
  SMTP_USER: optionalSecret,
  SMTP_PASS: optionalSecret,
  EMAIL_FROM: z.string().default('Ateliux <no-reply@ateliux.com.br>'),
  CLOUDINARY_CLOUD_NAME: optionalSecret,
  CLOUDINARY_API_KEY: optionalSecret,
  CLOUDINARY_API_SECRET: optionalSecret,
  CLOUDINARY_ROOT_FOLDER: z.string().default('ateliux'),
  UPLOAD_MAX_GLOBAL_SIZE_MB: z.coerce.number().int().positive().default(20),
  UPLOAD_AUTO_APPROVE_ADMIN_SAFE_CONTEXTS: booleanString.default(true),
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_LIMIT: z.coerce.number().int().positive().default(100),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid backend environment: ${issues}`);
  }

  return parsed.data;
}
