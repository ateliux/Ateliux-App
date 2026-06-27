import type { AdminRole, UserRole } from '@prisma/client';

export type RequestUser = {
  id: string;
  email: string;
  role: UserRole;
  adminRole?: AdminRole;
  adminUserId?: string;
  clientId?: string;
};
