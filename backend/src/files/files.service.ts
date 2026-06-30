import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  FileDownloadMode,
  FileRiskLevel,
  FileStatus,
  FileVisibility,
  NotificationAudience,
  UserRole,
} from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/utils/request-user';
import type { CreateFileAssetDto } from './dto/create-file-asset.dto';
import type { RejectFileDto } from './dto/reject-file.dto';
import type { UpdateFileAssetDto } from './dto/update-file-asset.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  findClientAll(user: RequestUser) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.prisma.fileAsset.findMany({
      where: {
        clientId: user.clientId,
        visibility: FileVisibility.CLIENT_VISIBLE,
        status: { not: FileStatus.DELETED },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientId: true,
        projectId: true,
        originalName: true,
        safeName: true,
        name: true,
        extension: true,
        mimeType: true,
        detectedMime: true,
        size: true,
        context: true,
        origin: true,
        status: true,
        riskLevel: true,
        downloadMode: true,
        rejectionReason: true,
        createdAt: true,
        deletedAt: true,
      },
    });
  }

  findAdminAll() {
    return this.prisma.fileAsset.findMany({
      where: { status: { not: FileStatus.DELETED } },
      orderBy: { createdAt: 'desc' },
      include: { client: true, project: true, uploadedBy: true },
    });
  }

  pendingReview() {
    return this.prisma.fileAsset.findMany({
      where: { status: FileStatus.PENDING_REVIEW, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { client: true, project: true, uploadedBy: true },
    });
  }

  create(user: RequestUser | null, dto: CreateFileAssetDto) {
    void user;
    void dto;
    throw new BadRequestException('Use os endpoints seguros de upload multipart.');
  }

  async update(id: string, dto: UpdateFileAssetDto) {
    await this.ensureExists(id);
    return this.prisma.fileAsset.update({ where: { id }, data: dto });
  }

  async approve(id: string, user: RequestUser) {
    const file = await this.ensureExists(id);
    const updated = await this.prisma.fileAsset.update({
      where: { id },
      data: { status: FileStatus.APPROVED, rejectionReason: null },
    });

    await this.auditLogs.create({
      actorId: user.adminUserId ?? user.id,
      actorType: 'admin',
      action: 'FILE_APPROVED',
      entityType: 'FileAsset',
      entityId: file.id,
      clientId: file.clientId ?? undefined,
      projectId: file.projectId ?? undefined,
    });

    await this.notifyClient(file, 'Arquivo aprovado', 'Um arquivo enviado foi aprovado e esta disponivel no Portal do Cliente.', 'file.approved');

    return updated;
  }

  async reject(id: string, user: RequestUser, dto: RejectFileDto) {
    const file = await this.ensureExists(id);
    const updated = await this.prisma.fileAsset.update({
      where: { id },
      data: {
        status: FileStatus.REJECTED,
        rejectionReason: dto.reason,
      },
    });

    await this.auditLogs.create({
      actorId: user.adminUserId ?? user.id,
      actorType: 'admin',
      action: 'FILE_REJECTED',
      entityType: 'FileAsset',
      entityId: file.id,
      clientId: file.clientId ?? undefined,
      projectId: file.projectId ?? undefined,
      metadata: { reason: dto.reason },
    });

    await this.notifyClient(
      file,
      'Arquivo rejeitado',
      `Um arquivo enviado foi rejeitado. Motivo: ${dto.reason}`,
      'file.rejected',
    );

    return updated;
  }

  async signedUrl(id: string, user: RequestUser) {
    const file = await this.ensureExists(id);

    if (user.role === UserRole.CLIENT) {
      if (!user.clientId || file.clientId !== user.clientId) {
        await this.auditLogs.create({
          actorId: user.id,
          actorType: 'client',
          action: 'UNAUTHORIZED_FILE_ACCESS_ATTEMPT',
          entityType: 'FileAsset',
          entityId: file.id,
          clientId: file.clientId ?? undefined,
          projectId: file.projectId ?? undefined,
        });
        throw new ForbiddenException('Arquivo nao pertence ao cliente autenticado.');
      }

      if (file.status !== FileStatus.APPROVED) {
        throw new ForbiddenException('Arquivo ainda nao esta aprovado para download.');
      }
    }

    if (file.status === FileStatus.DELETED || file.status === FileStatus.REJECTED) {
      throw new ForbiddenException('Arquivo indisponivel.');
    }

    const publicId = file.cloudinaryPublicId ?? file.storageKey;
    let url = file.secureUrl ?? file.url;

    try {
      url = this.storage.signedUrl(publicId, {
        attachmentName: file.safeName,
        forceAttachment: this.shouldForceAttachment(file),
        resourceType: file.cloudinaryResourceType,
      });
    } catch {
      if (!url) {
        throw new BadRequestException('Arquivo sem URL disponivel.');
      }
      this.logger.warn(`Signed URL fallback used because storage is not configured. fileId=${file.id}`);
    }

    await this.auditLogs.create({
      actorId: user.adminUserId ?? user.id,
      actorType: user.role === UserRole.ADMIN ? 'admin' : 'client',
      action: user.role === UserRole.ADMIN ? 'ADMIN_FILE_DOWNLOAD_REQUESTED' : 'FILE_SIGNED_URL_REQUESTED',
      entityType: 'FileAsset',
      entityId: file.id,
      clientId: file.clientId ?? undefined,
      projectId: file.projectId ?? undefined,
      metadata: {
        riskLevel: file.riskLevel ?? FileRiskLevel.DOWNLOAD_ONLY,
        downloadMode: file.downloadMode ?? FileDownloadMode.ATTACHMENT_ONLY,
        forceAttachment: this.shouldForceAttachment(file),
      },
    });

    return {
      url,
      riskLevel: file.riskLevel ?? FileRiskLevel.DOWNLOAD_ONLY,
      downloadMode: file.downloadMode ?? FileDownloadMode.ATTACHMENT_ONLY,
    };
  }

  async remove(id: string, user?: RequestUser) {
    const file = await this.ensureExists(id);
    const actorId = user?.adminUserId ?? user?.id;

    if (!user || user.role !== UserRole.ADMIN) {
      await this.auditLogs.create({
        actorId,
        actorType: user?.role === UserRole.CLIENT ? 'client' : 'system',
        action: 'FILE_DELETE_BLOCKED_PERMISSION',
        entityType: 'FileAsset',
        entityId: file.id,
        clientId: file.clientId ?? undefined,
        projectId: file.projectId ?? undefined,
        metadata: {
          actorRole: user?.adminRole ?? user?.role ?? 'missing',
          statusBefore: file.status,
        },
      });
      throw new ForbiddenException('Somente a admin pode excluir arquivos do armazenamento.');
    }

    if (file.status === FileStatus.DELETED) {
      return {
        id: file.id,
        status: FileStatus.DELETED,
        storageDeleted: true,
        storageProvider: file.storageProvider,
        storageDeleteResult: 'already_deleted',
      };
    }

    const usedBy = await this.getFileUsage(file.id);

    await this.auditLogs.create({
      actorId,
      actorType: 'admin',
      action: 'FILE_DELETE_REQUESTED',
      entityType: 'FileAsset',
      entityId: file.id,
      clientId: file.clientId ?? undefined,
      projectId: file.projectId ?? undefined,
      metadata: {
        actorRole: user.adminRole ?? user.role,
        fileId: file.id,
        storageProvider: file.storageProvider,
        cloudinaryPublicId: file.cloudinaryPublicId,
        cloudinaryResourceType: this.resolveCloudinaryResourceType(file),
        originalName: file.originalName,
        statusBefore: file.status,
        usedBy,
      },
    });

    if (this.hasBlockingUsage(usedBy)) {
      await this.auditLogs.create({
        actorId,
        actorType: 'admin',
        action: 'FILE_DELETE_BLOCKED_IN_USE',
        entityType: 'FileAsset',
        entityId: file.id,
        clientId: file.clientId ?? undefined,
        projectId: file.projectId ?? undefined,
        metadata: {
          actorRole: user.adminRole ?? user.role,
          usedBy,
          statusBefore: file.status,
        },
      });

      throw new ConflictException('Arquivo em uso por outro registro ativo. Remova o vinculo antes de excluir.');
    }

    let storageDeleted = false;
    let storageDeleteResult = 'not_applicable';

    if (file.storageProvider === 'cloudinary' && file.cloudinaryPublicId) {
      const storageResult = await this.storage.deleteFile({
        provider: file.storageProvider,
        publicId: file.cloudinaryPublicId,
        resourceType: this.resolveCloudinaryResourceType(file),
        invalidate: true,
      });

      if (!storageResult.success) {
        await this.auditLogs.create({
          actorId,
          actorType: 'admin',
          action: 'FILE_STORAGE_DELETE_FAILED',
          entityType: 'FileAsset',
          entityId: file.id,
          clientId: file.clientId ?? undefined,
          projectId: file.projectId ?? undefined,
          metadata: {
            actorRole: user.adminRole ?? user.role,
            storageProvider: file.storageProvider,
            cloudinaryPublicId: file.cloudinaryPublicId,
            cloudinaryResourceType: this.resolveCloudinaryResourceType(file),
            originalName: file.originalName,
            statusBefore: file.status,
            usedBy,
            storageResult: {
              success: storageResult.success,
              provider: storageResult.provider,
              publicId: storageResult.publicId,
              result: this.storageResultLabel(storageResult.result),
              error: storageResult.error,
            },
          },
        });

        throw new ServiceUnavailableException('Nao foi possivel remover o arquivo do Cloudinary. Tente novamente.');
      }

      storageDeleted = true;
      storageDeleteResult = this.storageResultLabel(storageResult.result ?? true);

      await this.auditLogs.create({
        actorId,
        actorType: 'admin',
        action: 'FILE_STORAGE_DELETE_SUCCEEDED',
        entityType: 'FileAsset',
        entityId: file.id,
        clientId: file.clientId ?? undefined,
        projectId: file.projectId ?? undefined,
        metadata: {
          actorRole: user.adminRole ?? user.role,
          storageProvider: file.storageProvider,
          cloudinaryPublicId: file.cloudinaryPublicId,
          cloudinaryResourceType: this.resolveCloudinaryResourceType(file),
          originalName: file.originalName,
          statusBefore: file.status,
          usedBy,
          storageResult: storageDeleteResult,
        },
      });
    }

    const updated = await this.prisma.fileAsset.update({
      where: { id },
      data: {
        status: FileStatus.DELETED,
        deletedAt: new Date(),
        secureUrl: null,
        url: '',
      },
    });

    await this.auditLogs.create({
      actorId,
      actorType: 'admin',
      action: 'FILE_DELETED',
      entityType: 'FileAsset',
      entityId: file.id,
      clientId: file.clientId ?? undefined,
      projectId: file.projectId ?? undefined,
      metadata: {
        actorRole: user.adminRole ?? user.role,
        fileId: file.id,
        storageProvider: file.storageProvider,
        cloudinaryPublicId: file.cloudinaryPublicId,
        cloudinaryResourceType: this.resolveCloudinaryResourceType(file),
        originalName: file.originalName,
        statusBefore: file.status,
        statusAfter: FileStatus.DELETED,
        usedBy,
        storageDeleted,
        storageResult: storageDeleteResult,
      },
    });

    return {
      ...updated,
      success: true,
      storageDeleted,
      storageProvider: file.storageProvider,
      storageDeleteResult,
    };
  }

  async getFileUsage(fileId: string) {
    const [
      usedByBlogPosts,
      usedByInboxMessages,
      usedByRequests,
      usedBySupportTickets,
      usedByFinanceRecords,
    ] = await Promise.all([
      this.prisma.blogPost.count({
        where: {
          OR: [{ coverFileId: fileId }, { heroImageFileId: fileId }],
        },
      }),
      this.prisma.inboxMessage.count({
        where: { attachments: { some: { id: fileId } } },
      }),
      this.prisma.clientRequestAttachment.count({ where: { fileAssetId: fileId } }),
      this.prisma.supportTicketAttachment.count({ where: { fileAssetId: fileId } }),
      this.prisma.financeRecord.count({ where: { receiptFileId: fileId } }),
    ]);

    return {
      usedByBlogPosts,
      usedByInboxMessages,
      usedByRequests,
      usedBySupportTickets,
      usedByPreviews: 0,
      usedByFinanceRecords,
    };
  }

  private async ensureExists(id: string) {
    const file = await this.prisma.fileAsset.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found.');
    return file;
  }

  private shouldForceAttachment(file: Awaited<ReturnType<FilesService['ensureExists']>>) {
    return (
      file.downloadMode !== FileDownloadMode.INLINE_ALLOWED ||
      file.riskLevel === FileRiskLevel.HIGH_RISK_DOWNLOAD_ONLY
    );
  }

  private hasBlockingUsage(usage: Awaited<ReturnType<FilesService['getFileUsage']>>) {
    return usage.usedByBlogPosts > 0 || usage.usedByFinanceRecords > 0 || usage.usedByPreviews > 0;
  }

  private resolveCloudinaryResourceType(file: Awaited<ReturnType<FilesService['ensureExists']>>) {
    if (file.cloudinaryResourceType === 'image' || file.cloudinaryResourceType === 'video' || file.cloudinaryResourceType === 'raw') {
      return file.cloudinaryResourceType;
    }

    if (file.mimeType.startsWith('image/')) return 'image';
    if (file.mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }

  private storageResultLabel(result: unknown) {
    if (typeof result === 'string') return result;
    if (typeof result === 'boolean') return result ? 'true' : 'false';
    if (result && typeof result === 'object' && 'result' in result) {
      return String((result as { result?: unknown }).result ?? 'unknown');
    }
    return result ? 'ok' : 'unknown';
  }

  private async notifyClient(
    file: Awaited<ReturnType<FilesService['ensureExists']>>,
    title: string,
    body: string,
    type: string,
  ) {
    if (!file.clientId) return;

    const account = await this.prisma.clientAccount.findUnique({
      where: { clientId: file.clientId },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: account?.userId,
        audience: NotificationAudience.CLIENT,
        clientId: file.clientId,
        projectId: file.projectId,
        type,
        title,
        body,
        entityType: 'FileAsset',
        entityId: file.id,
      },
    });
  }
}
