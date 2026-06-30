/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Priority, UserRole } from '@prisma/client';
import { ClientRequestsService } from './client-requests.service';
import type { RequestUser } from '../common/utils/request-user';
import type { PrismaService } from '../prisma/prisma.service';

type MessageCreateInput = {
  data: {
    attachments?: { connect?: Array<{ id: string }> };
  };
};

type RequestCreateInput = {
  data: {
    attachments?: { create?: Array<{ fileAssetId: string }> };
  };
};

const clientUser: RequestUser = {
  id: 'user-client',
  email: 'cliente@ateliux.test',
  role: UserRole.CLIENT,
  clientId: 'client-1',
};

function createService(fileRows: Array<{ id: string; projectId: string | null }> = [{ id: 'file-1', projectId: null }]) {
  let messageCreateInput: MessageCreateInput | undefined;
  let requestCreateInput: RequestCreateInput | undefined;

  const tx = {
    project: {
      findFirst: async () => ({ id: 'project-1' }),
    },
    fileAsset: {
      findMany: async () => fileRows,
    },
    inboxConversation: {
      create: async () => ({ id: 'conversation-1' }),
    },
    inboxMessage: {
      create: async (input: MessageCreateInput) => {
        messageCreateInput = input;
        return { id: 'message-1', attachments: fileRows };
      },
    },
    clientRequest: {
      create: async (input: RequestCreateInput) => {
        requestCreateInput = input;
        return { id: 'request-1', ...input.data };
      },
    },
  };

  const prisma = {
    $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx),
  } as unknown as PrismaService;

  return {
    service: new ClientRequestsService(prisma),
    getMessageCreateInput: () => messageCreateInput,
    getRequestCreateInput: () => requestCreateInput,
  };
}

describe('ClientRequestsService attachments', () => {
  it('vincula o mesmo FileAsset na solicitacao e na mensagem da inbox', async () => {
    const { service, getMessageCreateInput, getRequestCreateInput } = createService();

    await service.createClient(clientUser, {
      title: 'Trocar banner',
      description: 'Usar a nova referencia enviada.',
      category: 'design',
      priority: Priority.HIGH,
      projectId: 'project-1',
      fileAssetIds: ['file-1'],
    });

    assert.deepEqual(getMessageCreateInput()?.data.attachments?.connect, [{ id: 'file-1' }]);
    assert.deepEqual(getRequestCreateInput()?.data.attachments?.create, [{ fileAssetId: 'file-1' }]);
  });

  it('bloqueia arquivo inexistente ou de outro cliente', async () => {
    const { service } = createService([]);

    await assert.rejects(
      () =>
        service.createClient(clientUser, {
          title: 'Trocar banner',
          description: 'Usar a nova referencia enviada.',
          priority: Priority.MEDIUM,
          fileAssetIds: ['file-other'],
        }),
      /nao pertencem ao cliente/,
    );
  });
});
