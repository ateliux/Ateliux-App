/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AccountStatus, AdminRole, ClientPipelineStatus, UserRole } from '@prisma/client';
import type { RequestUser } from '../common/utils/request-user';
import { ClientsService } from './clients.service';

function createClientsPrismaMock() {
  const calls = {
    clientUpdates: [] as unknown[],
    auditLogs: [] as unknown[],
  };

  const client = {
    id: 'client-1',
    name: 'Ana Carvalho',
    company: 'Marima',
    email: 'ana@marima.com',
    phone: null,
    plan: 'Profissional',
    status: AccountStatus.ACTIVE,
    pipelineStatus: ClientPipelineStatus.NEW,
    responsibleId: 'admin-1',
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-20'),
    responsible: null,
    account: null,
    projects: [],
  };

  return {
    calls,
    prisma: {
      client: {
        findUnique: async ({ where }: { where: { id?: string; email?: string } }) =>
          where.id === client.id || where.email === client.email ? client : null,
        update: async ({ data }: { data: { pipelineStatus?: ClientPipelineStatus } }) => {
          calls.clientUpdates.push(data);
          return { ...client, ...data };
        },
      },
      auditLog: {
        create: async ({ data }: { data: unknown }) => {
          calls.auditLogs.push(data);
          return data;
        },
      },
    },
  };
}

describe('ClientsService', () => {
  it('persiste status comercial do cliente e registra auditoria', async () => {
    const { prisma, calls } = createClientsPrismaMock();
    const service = new ClientsService(
      prisma as unknown as ConstructorParameters<typeof ClientsService>[0],
      {} as ConstructorParameters<typeof ClientsService>[1],
    );
    const user: RequestUser = {
      id: 'user-admin-1',
      email: 'admin@ateliux.test',
      role: UserRole.ADMIN,
      adminRole: AdminRole.PROJECT_MANAGER,
      adminUserId: 'admin-1',
    };

    const result = await service.updatePipelineStatus(
      'client-1',
      { status: ClientPipelineStatus.DESIGN },
      user,
    );

    assert.equal(result.pipelineStatus, ClientPipelineStatus.DESIGN);
    assert.deepEqual(calls.clientUpdates, [{ pipelineStatus: ClientPipelineStatus.DESIGN }]);
    assert.equal(calls.auditLogs.length, 1);
    assert.deepEqual(calls.auditLogs[0], {
      actorId: 'admin-1',
      actorType: 'admin',
      action: 'CLIENT_PIPELINE_STATUS_UPDATED',
      entityType: 'Client',
      entityId: 'client-1',
      clientId: 'client-1',
      metadata: {
        title: 'Status comercial do cliente atualizado',
        description: 'Status comercial interno atualizado pela equipe Ateliux.',
        before: ClientPipelineStatus.NEW,
        after: ClientPipelineStatus.DESIGN,
      },
    });
  });
});
