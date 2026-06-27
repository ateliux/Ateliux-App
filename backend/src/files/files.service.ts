import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FileStatus, FileVisibility, NotificationAudience, UserRole } from '@prisma/client';
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

    if (file.cloudinaryPublicId) {
      try {
        await this.storage.deleteAsset(file.cloudinaryPublicId);
      } catch {
        this.logger.warn(`Cloudinary cleanup failed after rejection. fileId=${id}`);
      }
    }

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
      url = this.storage.signedUrl(publicId);
    } catch {
      if (!url) {
        throw new BadRequestException('Arquivo sem URL disponivel.');
      }
      this.logger.warn(`Signed URL fallback used because storage is not configured. fileId=${file.id}`);
    }

    await this.auditLogs.create({
      actorId: user.adminUserId ?? user.id,
      actorType: user.role === UserRole.ADMIN ? 'admin' : 'client',
      action: 'FILE_SIGNED_URL_REQUESTED',
      entityType: 'FileAsset',
      entityId: file.id,
      clientId: file.clientId ?? undefined,
      projectId: file.projectId ?? undefined,
    });

    return { url };
  }

  async remove(id: string, user?: RequestUser) {
    const file = await this.ensureExists(id);

    if (user?.role === UserRole.CLIENT && (!user.clientId || file.clientId !== user.clientId)) {
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

    let cloudinaryDeleted = false;

    if (file.cloudinaryPublicId) {
      try {
        await this.storage.deleteAsset(file.cloudinaryPublicId);
        cloudinaryDeleted = true;
      } catch {
        this.logger.warn(`Cloudinary delete failed. fileId=${id}`);
      }
    }

    await this.prisma.fileAsset.update({
      where: { id },
      data: { status: FileStatus.DELETED, deletedAt: new Date() },
    });

    if (user) {
      await this.auditLogs.create({
        actorId: user.adminUserId ?? user.id,
        actorType: user.role === UserRole.ADMIN ? 'admin' : 'client',
        action: 'FILE_DELETED',
        entityType: 'FileAsset',
        entityId: file.id,
        clientId: file.clientId ?? undefined,
        projectId: file.projectId ?? undefined,
        metadata: { cloudinaryDeleted },
      });
    }

    return { success: true, cloudinaryDeleted };
  }

  private async ensureExists(id: string) {
    const file = await this.prisma.fileAsset.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found.');
    return file;
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
