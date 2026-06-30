/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminRole, FileDownloadMode, FileRiskLevel, FileStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadValidationService } from './upload-validation.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import type { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { RequestUser } from '../common/utils/request-user';
import type { FilesService } from '../files/files.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';

const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

function multerFile(name: string, mimetype: string, buffer: Buffer) {
  return {
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype,
    size: buffer.length,
    buffer,
  } as Express.Multer.File;
}

function createService(projectClientId = 'client-1') {
  const createdAssets: Array<Record<string, unknown>> = [];
  const auditActions: string[] = [];
  const queueJobs: string[] = [];

  const storage = {
    uploadBuffer: async (input: { safeName: string }) => ({
      provider: 'cloudinary' as const,
      publicId: `ateliux/test/${input.safeName}`,
      resourceType: input.safeName.endsWith('.png') ? 'image' : 'raw',
      secureUrl: `https://res.cloudinary.com/test/${input.safeName}`,
      folder: 'ateliux/test',
    }),
    deleteAsset: async () => ({ skipped: false }),
    prepareUpload: (folder: string) => ({ provider: 'cloudinary' as const, configured: true, folder }),
    signedUrl: (id: string) => `https://signed.test/${id}`,
  } as unknown as StorageService;

  const prisma = {
    project: {
      findUnique: async () => ({ id: 'project-1', clientId: projectClientId }),
    },
    client: {
      findUnique: async ({ where }: { where: { id: string } }) => ({ id: where.id }),
    },
    fileAsset: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        createdAssets.push(data);
        return { id: `file-${createdAssets.length}`, ...data };
      },
    },
  } as unknown as PrismaService;

  const auditLogs = {
    create: async (input: { action: string }) => {
      auditActions.push(input.action);
      return input;
    },
  } as unknown as AuditLogsService;

  const queue = {
    add: async (name: string) => {
      queueJobs.push(name);
      return { id: name };
    },
  };

  const service = new UploadsService(
    storage,
    new UploadValidationService(),
    prisma,
    auditLogs,
    {} as FilesService,
    queue as never,
  );

  return { service, createdAssets, auditActions, queueJobs };
}

const clientUser: RequestUser = {
  id: 'user-client',
  email: 'cliente@ateliux.test',
  role: UserRole.CLIENT,
  clientId: 'client-1',
};

const adminUser: RequestUser = {
  id: 'user-admin',
  email: 'admin@ateliux.test',
  role: UserRole.ADMIN,
  adminRole: AdminRole.ADMIN,
  adminUserId: 'admin-1',
};

const editorUser: RequestUser = {
  id: 'user-editor',
  email: 'editor@ateliux.test',
  role: UserRole.ADMIN,
  adminRole: AdminRole.EDITOR,
  adminUserId: 'admin-editor',
};

describe('Uploads secure flow', () => {
  it('POST /uploads exige JwtAuthGuard e falha sem autenticacao', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UploadsController.prototype.uploadAuthenticated,
    ) as unknown[];

    assert.ok(guards.includes(JwtAuthGuard));
  });

  it('falha quando cliente tenta enviar arquivo com clientId de outro cliente', async () => {
    const { service, auditActions } = createService();

    await assert.rejects(
      () =>
        service.uploadClient(
          multerFile('contrato.pdf', 'application/pdf', pdfBuffer),
          { context: 'client_file', clientId: 'client-2' },
          clientUser,
          {},
        ),
      /outro clientId/,
    );

    assert.ok(auditActions.includes('UNAUTHORIZED_FILE_ACCESS_ATTEMPT'));
  });

  it('falha quando cliente envia para projectId de outro cliente', async () => {
    const { service } = createService('client-2');

    await assert.rejects(
      () =>
        service.uploadClient(
          multerFile('contrato.pdf', 'application/pdf', pdfBuffer),
          { context: 'client_file', projectId: 'project-1' },
          clientUser,
          {},
        ),
      /Projeto nao pertence/,
    );
  });

  it('falha quando admin envia arquivo do portal sem clientId', async () => {
    const { service, auditActions } = createService();

    await assert.rejects(
      () =>
        service.uploadAdmin(
          multerFile('contrato.pdf', 'application/pdf', pdfBuffer),
          { context: 'client_file' },
          adminUser,
          {},
        ),
      /clientId obrigatorio/,
    );

    assert.ok(auditActions.includes('FILE_UPLOAD_REJECTED_VALIDATION'));
  });

  it('upload valido cria FileAsset PENDING_REVIEW e fila de revisao', async () => {
    const { service, createdAssets, queueJobs, auditActions } = createService();

    const result = await service.uploadClient(
      multerFile('contrato.pdf', 'application/pdf', pdfBuffer),
      { context: 'client_file', projectId: 'project-1' },
      clientUser,
      { ipAddress: '127.0.0.1', userAgent: 'test' },
    );

    assert.equal((result as { status: FileStatus }).status, FileStatus.PENDING_REVIEW);
    assert.equal(createdAssets.length, 1);
    assert.equal(createdAssets[0].clientId, 'client-1');
    assert.ok(queueJobs.includes('file.pending_review.notification'));
    assert.ok(auditActions.includes('CLIENT_FILE_UPLOADED'));
  });

  it('upload de avatar valido entra APPROVED', async () => {
    const { service } = createService();

    const result = await service.uploadClient(
      multerFile('avatar.png', 'image/png', pngBuffer),
      { context: 'avatar' },
      clientUser,
      {},
    );

    assert.equal((result as { status: FileStatus }).status, FileStatus.APPROVED);
  });

  it('upload financeiro de admin entra APPROVED', async () => {
    const { service } = createService();

    const result = await service.uploadAdmin(
      multerFile('recibo.pdf', 'application/pdf', pdfBuffer),
      { context: 'finance_receipt', clientId: 'client-1' },
      adminUser,
      {},
    );

    assert.equal((result as { status: FileStatus }).status, FileStatus.APPROVED);
  });

  it('upload amplo de admin entra APPROVED e nao gera fila de revisao', async () => {
    const { service, createdAssets, queueJobs, auditActions } = createService();
    const jsonBuffer = Buffer.from('{"script":"nao renderizar inline"}');

    const result = await service.uploadAdmin(
      multerFile('tokens.json', 'application/json', jsonBuffer),
      { context: 'client_file', clientId: 'client-1', projectId: 'project-1' },
      adminUser,
      {},
    );

    assert.equal((result as { status: FileStatus }).status, FileStatus.APPROVED);
    assert.equal(createdAssets[0].riskLevel, FileRiskLevel.HIGH_RISK_DOWNLOAD_ONLY);
    assert.equal(createdAssets[0].downloadMode, FileDownloadMode.ATTACHMENT_ONLY);
    assert.equal(queueJobs.length, 0);
    assert.ok(auditActions.includes('ADMIN_FILE_DELIVERED_TO_CLIENT'));
  });

  it('admin sem role adequada recebe 403 em contexto financeiro', async () => {
    const { service, auditActions } = createService();

    await assert.rejects(
      () =>
        service.uploadAdmin(
          multerFile('recibo.pdf', 'application/pdf', pdfBuffer),
          { context: 'finance_receipt', clientId: 'client-1' },
          editorUser,
          {},
        ),
      /sem permissao/,
    );

    assert.ok(auditActions.includes('ADMIN_FILE_UPLOAD_DENIED_BY_ROLE'));
  });
});
