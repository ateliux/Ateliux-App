/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole } from '@prisma/client';
import { InboxService } from './inbox.service';
import type { RequestUser } from '../common/utils/request-user';
import type { PrismaService } from '../prisma/prisma.service';

type FindManyInput = {
  include?: {
    messages?: {
      include?: {
        attachments?: boolean;
      };
    };
  };
};

type MessageCreateInput = {
  data: {
    attachments?: { connect?: Array<{ id: string }> };
  };
};

const adminUser: RequestUser = {
  id: 'user-admin',
  email: 'admin@ateliux.test',
  role: UserRole.ADMIN,
  adminUserId: 'admin-1',
};

function createService() {
  let findManyInput: FindManyInput | undefined;
  let messageCreateInput: MessageCreateInput | undefined;

  const tx = {
    fileAsset: {
      findMany: async () => [{ id: 'file-1', clientId: 'client-1', projectId: null }],
    },
    inboxMessage: {
      create: async (input: MessageCreateInput) => {
        messageCreateInput = input;
        return { id: 'message-1', attachments: [{ id: 'file-1' }] };
      },
    },
    inboxConversation: {
      update: async () => ({ id: 'conversation-1' }),
    },
  };

  const prisma = {
    $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx),
    inboxConversation: {
      findMany: async (input: FindManyInput) => {
        findManyInput = input;
        return [];
      },
      findUnique: async () => ({
        id: 'conversation-1',
        clientId: 'client-1',
        projectId: null,
        messages: [],
      }),
    },
  } as unknown as PrismaService;

  return {
    service: new InboxService(prisma),
    getFindManyInput: () => findManyInput,
    getMessageCreateInput: () => messageCreateInput,
  };
}

describe('InboxService attachments', () => {
  it('listagem admin inclui anexos das mensagens', async () => {
    const { service, getFindManyInput } = createService();

    await service.findAdminAll();

    assert.equal(getFindManyInput()?.include?.messages?.include?.attachments, true);
  });

  it('resposta admin conecta fileAssetIds na mensagem da inbox', async () => {
    const { service, getMessageCreateInput } = createService();

    await service.addAdminMessage('conversation-1', adminUser, {
      body: 'Arquivo recebido.',
      fileAssetIds: ['file-1'],
    });

    assert.deepEqual(getMessageCreateInput()?.data.attachments?.connect, [{ id: 'file-1' }]);
  });
});
