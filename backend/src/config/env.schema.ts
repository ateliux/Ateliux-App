import { z } from 'zod';

const booleanString = z
  .string()
  .transform((value) => value === 'true')
  .or(z.boolean());

const optionalSecret = z.string().optional().default('');

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    API_PREFIX: z.string().default('api'),
    DATABASE_URL: z.string().url(),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    COOKIE_SECRET: z.string().min(16),
    COOKIE_DOMAIN: z.string().default(''),
    COOKIE_SECURE: booleanString.default(false),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    AUTH_DEBUG: booleanString.default(false),
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
    UPLOAD_MAX_GLOBAL_SIZE_MB: z.coerce.number().int().positive().default(100),
    ADMIN_UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().default(100),
    BLOG_IMAGE_UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().default(8),
    UPLOAD_AUTO_APPROVE_ADMIN_SAFE_CONTEXTS: booleanString.default(true),
    RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_LIMIT: z.coerce.number().int().positive().default(100),
  })
  .superRefine((env, ctx) => {
    const deployEnv = env.NODE_ENV === 'staging' || env.NODE_ENV === 'production';
    const corsOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);

    if (corsOrigins.includes('*')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: 'CORS_ORIGINS cannot use wildcard when credentials are enabled.',
      });
    }

    if (env.COOKIE_SAME_SITE === 'none' && !env.COOKIE_SECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true when COOKIE_SAME_SITE=none.',
      });
    }

    if (!deployEnv) return;

    if (!env.COOKIE_SECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true in staging/production.',
      });
    }

    if (env.COOKIE_DOMAIN === 'localhost') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_DOMAIN'],
        message: 'COOKIE_DOMAIN must not be localhost in staging/production.',
      });
    }

    if (corsOrigins.some((origin) => origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: 'CORS_ORIGINS must not point to localhost in staging/production.',
      });
    }

    const databaseHost = new URL(env.DATABASE_URL).hostname;
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(databaseHost)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'DATABASE_URL must not point to a local database in staging/production.',
      });
    }
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
