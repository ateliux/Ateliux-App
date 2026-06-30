import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminRole,
  FileOrigin,
  FileStatus,
  FileUploadedByType,
} from '@prisma/client';
import type { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../common/constants/queues';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { RequestUser } from '../common/utils/request-user';
import { FilesService } from '../files/files.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SecureUploadDto } from './dto/secure-upload.dto';
import { isUploadContext, type UploadContext } from './constants/upload-policy';
import {
  UploadValidationService,
  type UploadActorType,
} from './upload-validation.service';
import { classifyFileRisk } from './utils/file-risk';

export type UploadRequestMeta = {
  ipAddress?: string;
  userAgent?: string;
};

type UploadQueuePayload = {
  fileId: string;
  clientId?: string;
  projectId?: string;
  context: string;
  originalName: string;
};

const ADMIN_UPLOAD_ROLES: Record<UploadContext, readonly AdminRole[]> = {
  avatar: [
    AdminRole.ADMIN,
    AdminRole.PROJECT_MANAGER,
    AdminRole.SUPPORT,
    AdminRole.EDITOR,
    AdminRole.FINANCE,
    AdminRole.DESIGNER_DEV,
    AdminRole.ATTENDANCE,
  ],
  blog_cover: [AdminRole.ADMIN, AdminRole.EDITOR, AdminRole.DESIGNER_DEV],
  blog_hero: [AdminRole.ADMIN, AdminRole.EDITOR, AdminRole.DESIGNER_DEV],
  contact_attachment: [AdminRole.ADMIN, AdminRole.ATTENDANCE],
  support_attachment: [AdminRole.ADMIN, AdminRole.SUPPORT, AdminRole.PROJECT_MANAGER],
  client_file: [
    AdminRole.ADMIN,
    AdminRole.PROJECT_MANAGER,
    AdminRole.DESIGNER_DEV,
    AdminRole.SUPPORT,
  ],
  approval_attachment: [AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV],
  briefing_attachment: [AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV],
  finance_receipt: [AdminRole.ADMIN, AdminRole.FINANCE],
  preview_asset: [AdminRole.ADMIN, AdminRole.PROJECT_MANAGER, AdminRole.DESIGNER_DEV],
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly validation: UploadValidationService,
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    private readonly files: FilesService,
    @InjectQueue(QUEUE_NAMES.uploads)
    private readonly uploadsQueue: Queue<UploadQueuePayload>,
  ) {}

  prepare(folder = 'ateliux') {
    return this.storage.prepareUpload(folder);
  }

  async uploadClient(file: Express.Multer.File | undefined, dto: SecureUploadDto, user: RequestUser, meta: UploadRequestMeta) {
    if (!user.clientId) throw new ForbiddenException('Client id missing.');
    return this.upload(file, dto, {
      actorType: 'CLIENT',
      user,
      resolvedClientId: user.clientId,
      meta,
    });
  }

  async uploadAdmin(file: Express.Multer.File | undefined, dto: SecureUploadDto, user: RequestUser, meta: UploadRequestMeta) {
    return this.upload(file, dto, {
      actorType: 'ADMIN',
      user,
      resolvedClientId: dto.clientId,
      meta,
    });
  }

  async uploadPublic(file: Express.Multer.File | undefined, dto: SecureUploadDto, meta: UploadRequestMeta) {
    return this.upload(file, dto, {
      actorType: 'PUBLIC',
      user: null,
      resolvedClientId: undefined,
      meta,
    });
  }

  signedUrl(id: string, user: RequestUser) {
    return this.files.signedUrl(id, user);
  }

  delete(id: string, user: RequestUser) {
    return this.files.remove(id, user);
  }

  private async upload(
    file: Express.Multer.File | undefined,
    dto: SecureUploadDto,
    input: {
      actorType: UploadActorType;
      user: RequestUser | null;
      resolvedClientId?: string;
      meta: UploadRequestMeta;
    },
  ) {
    const actorId = this.resolveActorId(input.user);
    const actorType = input.actorType;
    const originalName = file?.originalname ?? 'unknown';

    await this.auditLogs.create({
      actorId,
      actorType: this.toAuditActorType(actorType),
      action: this.resolveUploadAttemptAuditAction(actorType),
      entityType: 'FileAsset',
      clientId: input.resolvedClientId,
      projectId: dto.projectId,
      ipAddress: input.meta.ipAddress,
      userAgent: input.meta.userAgent,
      metadata: {
        context: dto.context,
        actorRole: input.user?.adminRole ?? input.user?.role ?? this.toAuditActorType(actorType),
        uploadedByType: actorType,
        originalName,
        size: file?.size ?? 0,
        browserMime: file?.mimetype ?? 'unknown',
      },
    });

    if (actorType === 'ADMIN') {
      await this.assertAdminUploadPermission(dto.context, input.user, actorId, dto, input.meta);
    }

    const ownership = await this.resolveOwnership(dto, input);

    let validated: Awaited<ReturnType<UploadValidationService['validate']>>;
    try {
      validated = await this.validation.validate(file, {
        context: dto.context,
        clientId: ownership.clientId,
        projectId: ownership.projectId,
        actorType,
      });
    } catch (error) {
      await this.auditLogs.create({
        actorId,
        actorType: this.toAuditActorType(actorType),
        action: this.resolveValidationRejectedAuditAction(actorType),
        entityType: 'FileAsset',
        clientId: ownership.clientId,
        projectId: ownership.projectId,
        ipAddress: input.meta.ipAddress,
        userAgent: input.meta.userAgent,
        metadata: {
          context: dto.context,
          actorRole: input.user?.adminRole ?? input.user?.role ?? this.toAuditActorType(actorType),
          uploadedByType: actorType,
          originalName,
          reason: error instanceof Error ? error.message : 'validation_failed',
        },
      });
      throw error;
    }

    if (!file) {
      throw new BadRequestException('Arquivo obrigatorio.');
    }

    let uploaded: Awaited<ReturnType<StorageService['uploadBuffer']>> | null = null;
    const risk = classifyFileRisk({
      extension: validated.names.extension,
      mimeType: validated.providedMime,
      detectedMime: validated.detectedMime,
    });
    const status = this.resolveInitialStatus(actorType, validated.context, validated.policy.initialStatus);

    try {
      uploaded = await this.storage.uploadBuffer({
        buffer: file.buffer,
        safeName: validated.names.safeName,
        folder: validated.policy.folder,
        context: validated.context,
        clientId: ownership.clientId,
        projectId: ownership.projectId,
      });

      const asset = await this.prisma.fileAsset.create({
        data: {
          clientId: ownership.clientId,
          projectId: ownership.projectId,
          uploadedById: input.user?.id,
          uploadedByType: this.toUploadedByType(actorType),
          originalName: validated.names.originalName,
          safeName: validated.names.safeName,
          name: validated.names.safeName,
          extension: validated.names.extension,
          mimeType: validated.providedMime,
          detectedMime: validated.detectedMime,
          size: file.size,
          storageProvider: uploaded.provider,
          storageKey: uploaded.publicId,
          cloudinaryPublicId: uploaded.publicId,
          cloudinaryResourceType: uploaded.resourceType,
          secureUrl: uploaded.secureUrl,
          url: uploaded.secureUrl,
          origin: this.toOrigin(actorType),
          context: validated.policy.context,
          visibility: validated.policy.defaultVisibility,
          status,
          riskLevel: risk.riskLevel,
          downloadMode: risk.downloadMode,
        },
      });

      await this.auditLogs.create({
        actorId,
        actorType: this.toAuditActorType(actorType),
        action: this.resolveUploadAuditAction(actorType, asset.clientId ?? undefined),
        entityType: 'FileAsset',
        entityId: asset.id,
        clientId: asset.clientId ?? undefined,
        projectId: asset.projectId ?? undefined,
        ipAddress: input.meta.ipAddress,
        userAgent: input.meta.userAgent,
        metadata: {
          context: validated.context,
          actorRole: input.user?.adminRole ?? input.user?.role ?? this.toAuditActorType(actorType),
          uploadedByType: asset.uploadedByType,
          status: asset.status,
          extension: asset.extension,
          mimeType: asset.mimeType,
          detectedMime: asset.detectedMime ?? 'unknown',
          size: asset.size,
          riskLevel: asset.riskLevel,
          downloadMode: asset.downloadMode,
          cloudinaryPublicId: asset.cloudinaryPublicId,
          cloudinaryResourceType: asset.cloudinaryResourceType,
        },
      });

      if (asset.status === FileStatus.PENDING_REVIEW) {
        await this.uploadsQueue.add(
          'file.pending_review.notification',
          {
            fileId: asset.id,
            clientId: asset.clientId ?? undefined,
            projectId: asset.projectId ?? undefined,
            context: validated.context,
            originalName: asset.originalName,
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
        );
      }

      return actorType === 'ADMIN' ? asset : this.toClientFileResponse(asset);
    } catch (error) {
      if (uploaded?.publicId) {
        try {
          await this.storage.deleteAsset(uploaded.publicId, uploaded.resourceType);
        } catch {
          this.logger.warn(`Cloudinary cleanup failed after upload error. publicId=${uploaded.publicId}`);
        }
      }

      this.logger.error(
        `Secure upload failed. context=${dto.context} actorType=${actorType} clientId=${ownership.clientId ?? 'none'}`,
      );
      throw error;
    }
  }

  private async resolveOwnership(
    dto: SecureUploadDto,
    input: {
      actorType: UploadActorType;
      user: RequestUser | null;
      resolvedClientId?: string;
      meta: UploadRequestMeta;
    },
  ) {
    if (input.actorType === 'CLIENT') {
      if (!input.user?.clientId) throw new ForbiddenException('Client id missing.');

      if (dto.clientId && dto.clientId !== input.user.clientId) {
        await this.auditUnauthorized(input.user, dto.clientId, dto.projectId, input.meta);
        throw new ForbiddenException('Cliente nao pode enviar arquivo para outro clientId.');
      }

      await this.assertProjectBelongsToClient(dto.projectId, input.user.clientId);
      return { clientId: input.user.clientId, projectId: dto.projectId };
    }

    if (input.actorType === 'ADMIN') {
      if (dto.projectId && !dto.clientId) {
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project) throw new NotFoundException('Project not found.');
        return { clientId: project.clientId, projectId: project.id };
      }

      if (dto.clientId) {
        await this.assertClientExists(dto.clientId);
        await this.assertProjectBelongsToClient(dto.projectId, dto.clientId);
      }

      return { clientId: dto.clientId, projectId: dto.projectId };
    }

    if (dto.clientId || dto.projectId) {
      throw new ForbiddenException('Upload publico nao pode vincular clientId ou projectId.');
    }

    return { clientId: undefined, projectId: undefined };
  }

  private async assertAdminUploadPermission(
    context: string,
    user: RequestUser | null,
    actorId: string | undefined,
    dto: SecureUploadDto,
    meta: UploadRequestMeta,
  ) {
    if (!isUploadContext(context)) return;

    const role = user?.adminRole;
    const allowedRoles = ADMIN_UPLOAD_ROLES[context];

    if (role && allowedRoles.includes(role)) return;

    await this.auditLogs.create({
      actorId,
      actorType: 'admin',
      action: 'ADMIN_FILE_UPLOAD_DENIED_BY_ROLE',
      entityType: 'FileAsset',
      clientId: dto.clientId,
      projectId: dto.projectId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: {
        context,
        actorRole: role ?? 'missing',
        allowedRoles,
      },
    });

    throw new ForbiddenException('Perfil administrativo sem permissao para este contexto de upload.');
  }

  private async assertClientExists(clientId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client not found.');
  }

  private async assertProjectBelongsToClient(projectId: string | undefined, clientId: string) {
    if (!projectId) return;

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    if (project.clientId !== clientId) {
      this.logger.warn(`Upload rejected by project ownership. projectId=${projectId} clientId=${clientId}`);
      throw new ForbiddenException('Projeto nao pertence ao cliente informado.');
    }
  }

  private async auditUnauthorized(
    user: RequestUser,
    targetClientId: string | undefined,
    projectId: string | undefined,
    meta: UploadRequestMeta,
  ) {
    await this.auditLogs.create({
      actorId: this.resolveActorId(user),
      actorType: 'client',
      action: 'UNAUTHORIZED_FILE_ACCESS_ATTEMPT',
      entityType: 'FileAsset',
      clientId: targetClientId,
      projectId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: {
        authenticatedClientId: user.clientId ?? 'missing',
        reason: 'upload_client_mismatch',
      },
    });
  }

  private resolveActorId(user: RequestUser | null) {
    return user?.adminUserId ?? user?.id;
  }

  private toUploadedByType(actorType: UploadActorType) {
    if (actorType === 'CLIENT') return FileUploadedByType.CLIENT;
    if (actorType === 'ADMIN') return FileUploadedByType.ADMIN;
    if (actorType === 'SYSTEM') return FileUploadedByType.SYSTEM;
    return FileUploadedByType.PUBLIC;
  }

  private toOrigin(actorType: UploadActorType) {
    if (actorType === 'CLIENT') return FileOrigin.CLIENT;
    if (actorType === 'ADMIN') return FileOrigin.ATELIUX;
    if (actorType === 'SYSTEM') return FileOrigin.SYSTEM;
    return FileOrigin.PUBLIC;
  }

  private resolveInitialStatus(actorType: UploadActorType, context: string, policyStatus: FileStatus) {
    void context;
    if (actorType === 'ADMIN') {
      return FileStatus.APPROVED;
    }

    return policyStatus;
  }

  private resolveUploadAuditAction(actorType: UploadActorType, clientId?: string) {
    if (actorType === 'CLIENT') return 'CLIENT_FILE_UPLOADED';
    if (actorType === 'PUBLIC') return 'PUBLIC_FILE_UPLOADED';
    if (actorType === 'ADMIN' && clientId) return 'ADMIN_FILE_DELIVERED_TO_CLIENT';
    if (actorType === 'ADMIN') return 'ADMIN_FILE_UPLOADED';
    return 'SYSTEM_FILE_UPLOADED';
  }

  private resolveUploadAttemptAuditAction(actorType: UploadActorType) {
    if (actorType === 'ADMIN') return 'ADMIN_FILE_UPLOAD_ATTEMPT';
    return 'FILE_UPLOAD_ATTEMPT';
  }

  private resolveValidationRejectedAuditAction(actorType: UploadActorType) {
    if (actorType === 'CLIENT') return 'CLIENT_FILE_UPLOAD_REJECTED_VALIDATION';
    if (actorType === 'PUBLIC') return 'PUBLIC_FILE_UPLOAD_REJECTED_VALIDATION';
    return 'FILE_UPLOAD_REJECTED_VALIDATION';
  }

  private toAuditActorType(actorType: UploadActorType) {
    if (actorType === 'CLIENT') return 'client';
    if (actorType === 'ADMIN') return 'admin';
    if (actorType === 'PUBLIC') return 'public';
    return 'system';
  }

  private toClientFileResponse(asset: {
    id: string;
    clientId: string | null;
    projectId: string | null;
    originalName: string;
    safeName: string;
    name: string;
    extension: string;
    mimeType: string;
    detectedMime: string | null;
    size: number;
    context: unknown;
    origin: unknown;
    status: unknown;
    riskLevel: unknown;
    downloadMode: unknown;
    rejectionReason: string | null;
    createdAt: Date;
    deletedAt?: Date | null;
  }) {
    return {
      id: asset.id,
      clientId: asset.clientId,
      projectId: asset.projectId,
      originalName: asset.originalName,
      safeName: asset.safeName,
      name: asset.name,
      extension: asset.extension,
      mimeType: asset.mimeType,
      detectedMime: asset.detectedMime,
      size: asset.size,
      context: asset.context,
      origin: asset.origin,
      status: asset.status,
      riskLevel: asset.riskLevel,
      downloadMode: asset.downloadMode,
      rejectionReason: asset.rejectionReason,
      createdAt: asset.createdAt,
      deletedAt: asset.deletedAt ?? null,
    };
  }
}
