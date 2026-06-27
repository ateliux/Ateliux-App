/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FileStatus, FileVisibility, UserRole } from '@prisma/client';
import { FilesService } from './files.service';
import type { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { RequestUser } from '../common/utils/request-user';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';

const clientUser: RequestUser = {
  id: 'user-client',
  email: 'cliente@ateliux.test',
  role: UserRole.CLIENT,
  clientId: 'client-1',
};

const otherClientUser: RequestUser = {
  id: 'user-other',
  email: 'outro@ateliux.test',
  role: UserRole.CLIENT,
  clientId: 'client-2',
};

const adminUser: RequestUser = {
  id: 'user-admin',
  email: 'admin@ateliux.test',
  role: UserRole.ADMIN,
  adminUserId: 'admin-1',
};

function createService(initialStatus: FileStatus = FileStatus.PENDING_REVIEW) {
  const auditActions: string[] = [];
  const notifications: string[] = [];
  let deletedPublicId = '';
  let file = {
    id: 'file-1',
    clientId: 'client-1',
    projectId: 'project-1',
    status: initialStatus,
    visibility: FileVisibility.CLIENT_VISIBLE,
    cloudinaryPublicId: 'ateliux/test/file-1',
    storageKey: 'ateliux/test/file-1',
    rejectionReason: null as string | null,
  };

  const prisma = {
    fileAsset: {
      findUnique: async () => file,
      update: async ({ data }: { data: Partial<typeof file> }) => {
        file = { ...file, ...data };
        return file;
      },
      findMany: async () => [file],
    },
    clientAccount: {
      findUnique: async () => ({ userId: 'user-client' }),
    },
    notification: {
      create: async ({ data }: { data: { type: string } }) => {
        notifications.push(data.type);
        return data;
      },
    },
  } as unknown as PrismaService;

  const storage = {
    signedUrl: (publicId: string) => `https://signed.test/${publicId}`,
    deleteAsset: async (publicId: string) => {
      deletedPublicId = publicId;
      return { skipped: false };
    },
  } as unknown as StorageService;

  const auditLogs = {
    create: async (input: { action: string }) => {
      auditActions.push(input.action);
      return input;
    },
  } as unknown as AuditLogsService;

  return {
    service: new FilesService(prisma, storage, auditLogs),
    getFile: () => file,
    auditActions,
    notifications,
    getDeletedPublicId: () => deletedPublicId,
  };
}

describe('Files secure review flow', () => {
  it('approve muda status para APPROVED e notifica cliente', async () => {
    const { service, getFile, auditActions, notifications } = createService();

    await service.approve('file-1', adminUser);

    assert.equal(getFile().status, FileStatus.APPROVED);
    assert.ok(auditActions.includes('FILE_APPROVED'));
    assert.ok(notifications.includes('file.approved'));
  });

  it('reject muda status para REJECTED, salva motivo e remove Cloudinary', async () => {
    const { service, getFile, auditActions, notifications, getDeletedPublicId } = createService();

    await service.reject('file-1', adminUser, { reason: 'Conteudo suspeito' });

    assert.equal(getFile().status, FileStatus.REJECTED);
    assert.equal(getFile().rejectionReason, 'Conteudo suspeito');
    assert.equal(getDeletedPublicId(), 'ateliux/test/file-1');
    assert.ok(auditActions.includes('FILE_REJECTED'));
    assert.ok(notifications.includes('file.rejected'));
  });

  it('signed URL de arquivo de outro cliente falha e audita acesso negado', async () => {
    const { service, auditActions } = createService(FileStatus.APPROVED);

    await assert.rejects(() => service.signedUrl('file-1', otherClientUser), /nao pertence/);
    assert.ok(auditActions.includes('UNAUTHORIZED_FILE_ACCESS_ATTEMPT'));
  });

  it('signed URL de PENDING_REVIEW falha para cliente', async () => {
    const { service } = createService(FileStatus.PENDING_REVIEW);

    await assert.rejects(() => service.signedUrl('file-1', clientUser), /nao esta aprovado/);
  });

  it('signed URL de APPROVED retorna URL assinada e audita', async () => {
    const { service, auditActions } = createService(FileStatus.APPROVED);

    const result = await service.signedUrl('file-1', clientUser);

    assert.equal(result.url, 'https://signed.test/ateliux/test/file-1');
    assert.ok(auditActions.includes('FILE_SIGNED_URL_REQUESTED'));
  });

  it('delete marca como DELETED e tenta remover Cloudinary', async () => {
    const { service, getFile, auditActions, getDeletedPublicId } = createService(FileStatus.APPROVED);

    await service.remove('file-1', adminUser);

    assert.equal(getFile().status, FileStatus.DELETED);
    assert.equal(getDeletedPublicId(), 'ateliux/test/file-1');
    assert.ok(auditActions.includes('FILE_DELETED'));
  });
});
