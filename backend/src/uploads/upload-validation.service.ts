import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { fromBuffer } from 'file-type';
import { BLOCKED_UPLOAD_EXTENSIONS } from './blocked-extensions';
import {
  UPLOAD_POLICIES,
  isUploadContext,
  type UploadContext,
  type UploadPolicy,
} from './constants/upload-policy';
import { buildSafeFileName, type SafeFileName } from './utils/safe-filename';

export type UploadActorType = 'client' | 'admin' | 'public';

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
  detectedMime: string;
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
    this.assertActorAllowed(policy, input.actorType);

    if (file.size <= 0) {
      throw new BadRequestException('Arquivo vazio.');
    }

    if (file.size > policy.maxSizeBytes) {
      this.logger.warn(
        `Upload rejected by size. context=${context} size=${file.size} max=${policy.maxSizeBytes}`,
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
    this.assertExtension(names.extension, policy);
    this.assertProvidedMime(file.mimetype, policy);
    const detectedMime = await this.detectMime(file.buffer, names.extension, file.mimetype, policy);

    if (!policy.allowedMimeTypes.includes(detectedMime)) {
      this.logger.warn(
        `Upload rejected by magic bytes. context=${context} extension=${names.extension} browserMime=${file.mimetype} detectedMime=${detectedMime}`,
      );
      throw new BadRequestException('Tipo real do arquivo nao permitido.');
    }

    return {
      context,
      policy,
      names,
      providedMime: file.mimetype,
      detectedMime,
    };
  }

  private assertActorAllowed(policy: UploadPolicy, actorType: UploadActorType) {
    if (actorType === 'client' && !policy.allowClientUpload) {
      throw new ForbiddenException('Clientes nao podem enviar arquivo neste contexto.');
    }

    if (actorType === 'admin' && !policy.allowAdminUpload) {
      throw new ForbiddenException('Admins nao podem enviar arquivo neste contexto.');
    }

    if (actorType === 'public' && !policy.allowPublicUpload) {
      throw new ForbiddenException('Upload publico nao permitido neste contexto.');
    }
  }

  private assertExtension(extension: string, policy: UploadPolicy) {
    if (!extension) {
      throw new BadRequestException('Arquivo sem extensao.');
    }

    if (BLOCKED_UPLOAD_EXTENSIONS.has(extension)) {
      this.logger.warn(`Upload rejected by blocked extension. extension=${extension}`);
      throw new BadRequestException('Extensao de arquivo bloqueada por seguranca.');
    }

    if (!policy.allowedExtensions.includes(extension)) {
      throw new BadRequestException('Extensao nao permitida para este contexto.');
    }
  }

  private assertProvidedMime(mimeType: string, policy: UploadPolicy) {
    if (!mimeType || !policy.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('MIME type informado nao permitido.');
    }
  }

  private async detectMime(
    buffer: Buffer,
    extension: string,
    providedMime: string,
    policy: UploadPolicy,
  ) {
    const detected = await fromBuffer(buffer);

    if (detected?.mime && policy.allowedMimeTypes.includes(detected.mime)) {
      return detected.mime;
    }

    const fallbackMime = this.detectControlledFallback(buffer, extension, providedMime, detected?.mime);
    if (fallbackMime && policy.allowedMimeTypes.includes(fallbackMime)) {
      return fallbackMime;
    }

    throw new BadRequestException('Nao foi possivel validar o tipo real do arquivo.');
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
