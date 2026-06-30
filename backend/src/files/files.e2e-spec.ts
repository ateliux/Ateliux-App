/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FileDownloadMode,
  FileRiskLevel,
  FileStatus,
  FileVisibility,
  UserRole,
} from '@prisma/client';
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

function createService(
  initialStatus: FileStatus = FileStatus.PENDING_REVIEW,
  riskLevel: FileRiskLevel = FileRiskLevel.DOWNLOAD_ONLY,
  downloadMode: FileDownloadMode = FileDownloadMode.ATTACHMENT_ONLY,
) {
  const auditActions: string[] = [];
  const notifications: string[] = [];
  let deletedPublicId = '';
  let deleteResourceType = '';
  let signedOptions: { attachmentName?: string; forceAttachment?: boolean } | undefined;
  let storageDeleteSucceeds = true;
  let storageDeleteResult: unknown = 'ok';
  let blogPostUsage = 0;
  let file = {
    id: 'file-1',
    clientId: 'client-1',
    projectId: 'project-1',
    status: initialStatus,
    visibility: FileVisibility.CLIENT_VISIBLE,
    storageProvider: 'cloudinary',
    cloudinaryPublicId: 'ateliux/test/file-1',
    cloudinaryResourceType: 'raw',
    storageKey: 'ateliux/test/file-1',
    originalName: 'file-1.pdf',
    safeName: 'file-1.pdf',
    mimeType: 'application/pdf',
    secureUrl: 'https://res.cloudinary.com/test/file-1.pdf',
    url: 'https://res.cloudinary.com/test/file-1.pdf',
    riskLevel,
    downloadMode,
    rejectionReason: null as string | null,
    deletedAt: null as Date | null,
  };

  const prisma = {
    blogPost: {
      count: async () => blogPostUsage,
    },
    inboxMessage: {
      count: async () => 0,
    },
    clientRequestAttachment: {
      count: async () => 0,
    },
    supportTicketAttachment: {
      count: async () => 0,
    },
    financeRecord: {
      count: async () => 0,
    },
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
    signedUrl: (publicId: string, options?: { attachmentName?: string; forceAttachment?: boolean }) => {
      signedOptions = options;
      return `https://signed.test/${publicId}`;
    },
    deleteFile: async (input: { publicId?: string | null; resourceType?: string | null }) => {
      if (!storageDeleteSucceeds) {
        return { success: false, provider: 'cloudinary', publicId: input.publicId ?? undefined, error: 'failed' };
      }
      deletedPublicId = input.publicId ?? '';
      deleteResourceType = input.resourceType ?? '';
      return { success: true, provider: 'cloudinary', publicId: input.publicId ?? undefined, result: storageDeleteResult };
    },
    deleteAsset: async (publicId: string, resourceType?: string | null) => {
      deletedPublicId = publicId;
      deleteResourceType = resourceType ?? '';
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
    getDeleteResourceType: () => deleteResourceType,
    getSignedOptions: () => signedOptions,
    failStorageDelete: () => {
      storageDeleteSucceeds = false;
    },
    markStorageNotFound: () => {
      storageDeleteResult = 'not_found_treated_as_success';
    },
    setBlogPostUsage: (count: number) => {
      blogPostUsage = count;
    },
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

  it('reject muda status para REJECTED, salva motivo e nao remove Cloudinary', async () => {
    const { service, getFile, auditActions, notifications, getDeletedPublicId } = createService();

    await service.reject('file-1', adminUser, { reason: 'Conteudo suspeito' });

    assert.equal(getFile().status, FileStatus.REJECTED);
    assert.equal(getFile().rejectionReason, 'Conteudo suspeito');
    assert.equal(getDeletedPublicId(), '');
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

  it('signed URL de PENDING_REVIEW funciona para admin analisar', async () => {
    const { service, auditActions } = createService(FileStatus.PENDING_REVIEW);

    const result = await service.signedUrl('file-1', adminUser);

    assert.equal(result.url, 'https://signed.test/ateliux/test/file-1');
    assert.ok(auditActions.includes('ADMIN_FILE_DOWNLOAD_REQUESTED'));
  });

  it('signed URL de APPROVED retorna URL assinada e audita', async () => {
    const { service, auditActions, getSignedOptions } = createService(FileStatus.APPROVED);

    const result = await service.signedUrl('file-1', clientUser);

    assert.equal(result.url, 'https://signed.test/ateliux/test/file-1');
    assert.equal(result.downloadMode, FileDownloadMode.ATTACHMENT_ONLY);
    assert.equal(getSignedOptions()?.forceAttachment, true);
    assert.ok(auditActions.includes('FILE_SIGNED_URL_REQUESTED'));
  });

  it('signed URL de SAFE_PREVIEW permite inline', async () => {
    const { service, getSignedOptions } = createService(
      FileStatus.APPROVED,
      FileRiskLevel.SAFE_PREVIEW,
      FileDownloadMode.INLINE_ALLOWED,
    );

    await service.signedUrl('file-1', clientUser);

    assert.equal(getSignedOptions()?.forceAttachment, false);
  });

  it('delete admin remove Cloudinary com resource type e marca como DELETED', async () => {
    const { service, getFile, auditActions, getDeletedPublicId, getDeleteResourceType } = createService(FileStatus.APPROVED);

    const result = await service.remove('file-1', adminUser);

    assert.equal(getFile().status, FileStatus.DELETED);
    assert.equal(getFile().url, '');
    assert.equal(getDeletedPublicId(), 'ateliux/test/file-1');
    assert.equal(getDeleteResourceType(), 'raw');
    assert.equal(result.storageDeleted, true);
    assert.ok(auditActions.includes('FILE_DELETE_REQUESTED'));
    assert.ok(auditActions.includes('FILE_STORAGE_DELETE_SUCCEEDED'));
    assert.ok(auditActions.includes('FILE_DELETED'));
  });

  it('delete falha se Cloudinary falhar e nao marca DELETED', async () => {
    const { service, getFile, auditActions, failStorageDelete } = createService(FileStatus.APPROVED);
    failStorageDelete();

    await assert.rejects(() => service.remove('file-1', adminUser), /Cloudinary/);

    assert.equal(getFile().status, FileStatus.APPROVED);
    assert.ok(auditActions.includes('FILE_STORAGE_DELETE_FAILED'));
  });

  it('delete trata not found do Cloudinary como sucesso idempotente', async () => {
    const { service, getFile, markStorageNotFound } = createService(FileStatus.APPROVED);
    markStorageNotFound();

    const result = await service.remove('file-1', adminUser);

    assert.equal(getFile().status, FileStatus.DELETED);
    assert.equal(result.storageDeleteResult, 'not_found_treated_as_success');
  });

  it('delete bloqueia arquivo ainda usado por post de blog', async () => {
    const { service, getFile, auditActions, setBlogPostUsage } = createService(FileStatus.APPROVED);
    setBlogPostUsage(1);

    await assert.rejects(() => service.remove('file-1', adminUser), /em uso/);

    assert.equal(getFile().status, FileStatus.APPROVED);
    assert.ok(auditActions.includes('FILE_DELETE_BLOCKED_IN_USE'));
  });

  it('cliente nao consegue excluir arquivo', async () => {
    const { service, auditActions } = createService(FileStatus.APPROVED);

    await assert.rejects(() => service.remove('file-1', clientUser), /Somente a admin/);

    assert.ok(auditActions.includes('FILE_DELETE_BLOCKED_PERMISSION'));
  });
});
