import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import type * as FileType from 'file-type';
import { BLOCKED_UPLOAD_EXTENSIONS } from './blocked-extensions';
import {
  UPLOAD_POLICIES,
  isUploadContext,
  type UploadContext,
  type UploadActorPolicy,
  type UploadPolicy,
} from './constants/upload-policy';
import { buildSafeFileName, type SafeFileName } from './utils/safe-filename';

type FileTypeModule = typeof FileType;
type DetectedFileType = Awaited<ReturnType<FileTypeModule['fileTypeFromBuffer']>>;

const importFileType = new Function('moduleName', 'return import(moduleName)') as (
  moduleName: string,
) => Promise<FileTypeModule>;

let fileTypeModulePromise: Promise<FileTypeModule> | null = null;

async function detectFileType(buffer: Buffer): Promise<DetectedFileType> {
  fileTypeModulePromise ??= importFileType('file-type');
  const fileType = await fileTypeModulePromise;
  return fileType.fileTypeFromBuffer(buffer);
}

export type UploadActorType = 'CLIENT' | 'ADMIN' | 'PUBLIC' | 'SYSTEM';

export type UploadValidationInput = {
  context: string;
  clientId?: string;
  projectId?: string;
  actorType: UploadActorType;
};

export type ValidatedUpload = {
  context: UploadContext;
  policy: UploadPolicy;
  names: SafeFileName;
  providedMime: string;
  detectedMime: string | null;
};

@Injectable()
export class UploadValidationService {
  private readonly logger = new Logger(UploadValidationService.name);

  async validate(
    file: Express.Multer.File | undefined,
    input: UploadValidationInput,
  ): Promise<ValidatedUpload> {
    if (!file) {
      throw new BadRequestException('Arquivo obrigatorio.');
    }

    if (!file.buffer?.length) {
      throw new BadRequestException('Arquivo vazio ou sem buffer.');
    }

    if (!isUploadContext(input.context)) {
      throw new BadRequestException('Contexto de upload invalido.');
    }

    const context = input.context;
    const policy = UPLOAD_POLICIES[context];
    const actorPolicy = this.resolveActorPolicy(policy, input.actorType);
    this.assertActorAllowed(policy, input.actorType);

    if (file.size <= 0) {
      throw new BadRequestException('Arquivo vazio.');
    }

    const maxSizeBytes = this.resolveMaxSizeBytes(policy, input.actorType);
    if (file.size > maxSizeBytes) {
      this.logger.warn(
        `Upload rejected by size. context=${context} actorType=${input.actorType} size=${file.size} max=${maxSizeBytes}`,
      );
      throw new BadRequestException('Arquivo excede o limite permitido para este contexto.');
    }

    if (policy.requiresClientId && !input.clientId) {
      throw new BadRequestException('clientId obrigatorio para este contexto.');
    }

    if (policy.requiresProjectId && !input.projectId) {
      throw new BadRequestException('projectId obrigatorio para este contexto.');
    }

    const names = buildSafeFileName(file.originalname);
    const providedMime = normalizeProvidedMime(file.mimetype);
    this.assertExtension(names.extension, actorPolicy);
    this.assertProvidedMime(providedMime, actorPolicy);
    const detectedMime = await this.detectMime(file.buffer, names.extension, providedMime, actorPolicy, context);

    return {
      context,
      policy,
      names,
      providedMime,
      detectedMime,
    };
  }

  private assertActorAllowed(policy: UploadPolicy, actorType: UploadActorType) {
    if (actorType === 'CLIENT' && !policy.allowClientUpload) {
      throw new ForbiddenException('Clientes nao podem enviar arquivo neste contexto.');
    }

    if (actorType === 'ADMIN' && !policy.allowAdminUpload) {
      throw new ForbiddenException('Admins nao podem enviar arquivo neste contexto.');
    }

    if (actorType === 'PUBLIC' && !policy.allowPublicUpload) {
      throw new ForbiddenException('Upload publico nao permitido neste contexto.');
    }
  }

  private resolveActorPolicy(policy: UploadPolicy, actorType: UploadActorType) {
    if (actorType === 'ADMIN' || actorType === 'SYSTEM') return policy.adminPolicy;
    return policy.inboundPolicy;
  }

  private resolveMaxSizeBytes(policy: UploadPolicy, actorType: UploadActorType) {
    if (actorType === 'ADMIN' || actorType === 'SYSTEM') return policy.adminMaxSizeBytes;
    return policy.inboundMaxSizeBytes;
  }

  private assertExtension(extension: string, actorPolicy: UploadActorPolicy) {
    if (!extension) {
      throw new BadRequestException('Arquivo sem extensao.');
    }

    if (actorPolicy.blockKnownDangerousExtensions && BLOCKED_UPLOAD_EXTENSIONS.has(extension)) {
      this.logger.warn(`Upload rejected by blocked extension. extension=${extension}`);
      throw new BadRequestException('Extensao de arquivo bloqueada por seguranca.');
    }

    if (actorPolicy.allowedExtensions && !actorPolicy.allowedExtensions.includes(extension)) {
      throw new BadRequestException('Extensao nao permitida para este contexto.');
    }
  }

  private assertProvidedMime(mimeType: string, actorPolicy: UploadActorPolicy) {
    if (
      actorPolicy.mode === 'restricted' &&
      (!mimeType || !actorPolicy.allowedMimeTypes?.includes(mimeType))
    ) {
      throw new BadRequestException('MIME type informado nao permitido.');
    }
  }

  private async detectMime(
    buffer: Buffer,
    extension: string,
    providedMime: string,
    actorPolicy: UploadActorPolicy,
    context: UploadContext,
  ) {
    const detected = await detectFileType(buffer);

    if (detected?.mime && this.isMimeAllowed(detected.mime, actorPolicy)) {
      return detected.mime;
    }

    const fallbackMime = this.detectControlledFallback(buffer, extension, providedMime, detected?.mime);
    if (fallbackMime && this.isMimeAllowed(fallbackMime, actorPolicy)) {
      return fallbackMime;
    }

    if (detected?.mime && !this.isMimeAllowed(detected.mime, actorPolicy)) {
      this.logger.warn(
        `Upload rejected by detected MIME. context=${context} extension=${extension} browserMime=${providedMime} detectedMime=${detected.mime}`,
      );
      throw new BadRequestException('Tipo real do arquivo nao permitido.');
    }

    if (actorPolicy.mode === 'admin' && actorPolicy.allowUnknownDetectedMime) {
      return detected?.mime ?? null;
    }

    if (actorPolicy.requireDetectedMime) {
      this.logger.warn(
        `Upload rejected by missing magic bytes. context=${context} extension=${extension} browserMime=${providedMime}`,
      );
    }

    throw new BadRequestException('Nao foi possivel validar o tipo real do arquivo.');
  }

  private isMimeAllowed(mimeType: string, actorPolicy: UploadActorPolicy) {
    return !actorPolicy.allowedMimeTypes || actorPolicy.allowedMimeTypes.includes(mimeType);
  }

  private detectControlledFallback(
    buffer: Buffer,
    extension: string,
    providedMime: string,
    detectedMime?: string,
  ): string | null {
    if (extension === '.pdf' && buffer.subarray(0, 4).toString('utf8') === '%PDF') {
      return 'application/pdf';
    }

    if (
      extension === '.doc' &&
      providedMime === 'application/msword' &&
      buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
    ) {
      return 'application/msword';
    }

    if (
      extension === '.docx' &&
      providedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      (detectedMime === 'application/zip' ||
        buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])))
    ) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    return null;
  }
}

function normalizeProvidedMime(mimeType: string | undefined) {
  const normalized = (mimeType || 'application/octet-stream').trim().toLowerCase();
  if (normalized === 'image/jpg' || normalized === 'image/pjpeg') return 'image/jpeg';
  if (normalized === 'image/x-png') return 'image/png';
  if (normalized === 'image/jfif') return 'image/jpeg';
  return normalized;
}
