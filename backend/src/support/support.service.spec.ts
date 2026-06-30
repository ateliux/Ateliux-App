/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Priority, UserRole } from '@prisma/client';
import { SupportService } from './support.service';
import type { RequestUser } from '../common/utils/request-user';
import type { PrismaService } from '../prisma/prisma.service';

type MessageCreateInput = {
  data: {
    attachments?: { connect?: Array<{ id: string }> };
  };
};

type TicketCreateInput = {
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
  let ticketCreateInput: TicketCreateInput | undefined;
  let ticketAttachmentCreateMany:
    | { data: Array<{ supportTicketId: string; fileAssetId: string }>; skipDuplicates?: boolean }
    | undefined;

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
    supportTicket: {
      create: async (input: TicketCreateInput) => {
        ticketCreateInput = input;
        return { id: 'ticket-1', ...input.data };
      },
      update: async () => ({ id: 'ticket-1' }),
    },
    supportTicketAttachment: {
      createMany: async (input: { data: Array<{ supportTicketId: string; fileAssetId: string }>; skipDuplicates?: boolean }) => {
        ticketAttachmentCreateMany = input;
        return { count: input.data.length };
      },
    },
  };

  const prisma = {
    $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx),
    supportTicket: {
      findFirst: async () => ({
        id: 'ticket-1',
        clientId: 'client-1',
        projectId: null,
        inboxConversationId: 'conversation-1',
      }),
    },
  } as unknown as PrismaService;

  return {
    service: new SupportService(prisma),
    getMessageCreateInput: () => messageCreateInput,
    getTicketCreateInput: () => ticketCreateInput,
    getTicketAttachmentCreateMany: () => ticketAttachmentCreateMany,
  };
}

describe('SupportService attachments', () => {
  it('vincula anexo do ticket na mensagem da inbox e no SupportTicket', async () => {
    const { service, getMessageCreateInput, getTicketCreateInput } = createService();

    await service.createClient(clientUser, {
      subject: 'Erro no preview',
      category: 'Preview',
      priority: Priority.HIGH,
      message: 'O preview nao carrega.',
      fileAssetIds: ['file-1'],
    });

    assert.deepEqual(getMessageCreateInput()?.data.attachments?.connect, [{ id: 'file-1' }]);
    assert.deepEqual(getTicketCreateInput()?.data.attachments?.create, [{ fileAssetId: 'file-1' }]);
  });

  it('vincula anexo de resposta no SupportTicket existente', async () => {
    const { service, getMessageCreateInput, getTicketAttachmentCreateMany } = createService();

    await service.replyClient(clientUser, 'ticket-1', {
      body: 'Segue novo print.',
      fileAssetIds: ['file-1'],
    });

    assert.deepEqual(getMessageCreateInput()?.data.attachments?.connect, [{ id: 'file-1' }]);
    assert.deepEqual(getTicketAttachmentCreateMany()?.data, [{ supportTicketId: 'ticket-1', fileAssetId: 'file-1' }]);
  });

  it('bloqueia arquivo fora do contexto do suporte', async () => {
    const { service } = createService([]);

    await assert.rejects(
      () =>
        service.createClient(clientUser, {
          subject: 'Erro no preview',
          category: 'Preview',
          message: 'O preview nao carrega.',
          fileAssetIds: ['file-other'],
        }),
      /nao pertencem ao contexto/,
    );
  });
});
