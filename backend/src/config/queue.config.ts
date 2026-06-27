import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  mailQueue: 'mail',
  notificationsQueue: 'notifications',
  auditQueue: 'audit',
  uploadsQueue: 'uploads',
}));
