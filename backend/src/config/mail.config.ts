import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ?? '',
  pass: process.env.SMTP_PASS ?? '',
  from: process.env.EMAIL_FROM ?? 'Ateliux <no-reply@ateliux.com.br>',
}));
