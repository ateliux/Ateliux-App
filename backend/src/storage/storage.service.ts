import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadContext } from '../uploads/constants/upload-policy';

export type PreparedUpload = {
  provider: 'cloudinary';
  configured: boolean;
  folder: string;
};

export type StorageUploadInput = {
  buffer: Buffer;
  safeName: string;
  folder: string;
  context: UploadContext;
  clientId?: string;
  projectId?: string;
};

export type StorageUploadResult = {
  provider: 'cloudinary';
  publicId: string;
  resourceType: string;
  secureUrl: string;
  folder: string;
};

export type StorageDeleteResult = {
  success: boolean;
  provider: string;
  publicId?: string;
  result?: unknown;
  error?: string;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly configured: boolean;
  private readonly nodeEnv: string;
  private readonly rootFolder: string;

  constructor(config: ConfigService) {
    const cloudName = config.get<string>('cloudinary.cloudName') ?? '';
    const apiKey = config.get<string>('cloudinary.apiKey') ?? '';
    const apiSecret = config.get<string>('cloudinary.apiSecret') ?? '';
    this.nodeEnv = config.get<string>('app.nodeEnv') ?? 'development';
    this.rootFolder = config.get<string>('cloudinary.rootFolder') ?? 'ateliux';
    this.configured = Boolean(cloudName && apiKey && apiSecret);

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  prepareUpload(folder: string): PreparedUpload {
    return {
      provider: 'cloudinary',
      configured: this.configured,
      folder,
    };
  }

  signedUrl(publicId: string, options: { attachmentName?: string; forceAttachment?: boolean; resourceType?: string | null } = {}) {
    return cloudinary.url(publicId, {
      sign_url: true,
      secure: true,
      resource_type: this.normalizeResourceType(options.resourceType, 'image'),
      flags: options.forceAttachment
        ? options.attachmentName
          ? `attachment:${options.attachmentName}`
          : 'attachment'
        : undefined,
    });
  }

  async uploadBuffer(input: StorageUploadInput): Promise<StorageUploadResult> {
    if (!this.configured) {
      throw new ServiceUnavailableException('Cloudinary is not configured.');
    }

    const folder = this.buildFolder(input);
    const publicId = input.safeName.replace(/\.[^.]+$/, '');

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          overwrite: false,
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error || !result) {
            const reason = error instanceof Error ? error.message : 'unknown';
            this.logger.error(`Cloudinary upload failed. folder=${folder} reason=${reason}`);
            reject(new ServiceUnavailableException('Cloudinary upload failed.'));
            return;
          }

          resolve({
            provider: 'cloudinary',
            publicId: result.public_id,
            resourceType: result.resource_type ?? this.inferResourceType(input.safeName),
            secureUrl: result.secure_url,
            folder,
          });
        },
      );

      stream.end(input.buffer);
    });
  }

  async deleteFile(params: {
    provider: string;
    publicId?: string | null;
    resourceType?: string | null;
    invalidate?: boolean;
  }): Promise<StorageDeleteResult> {
    if (params.provider !== 'cloudinary') {
      return {
        success: false,
        provider: params.provider,
        publicId: params.publicId ?? undefined,
        error: `Provider ${params.provider} nao suportado para delete fisico.`,
      };
    }

    if (!params.publicId) {
      return {
        success: false,
        provider: params.provider,
        error: 'Cloudinary public id ausente.',
      };
    }

    if (!this.configured) {
      this.logger.warn(`Cloudinary delete unavailable because provider is not configured. publicId=${params.publicId}`);
      return {
        success: false,
        provider: params.provider,
        publicId: params.publicId,
        error: 'Cloudinary is not configured.',
      };
    }

    const resourceType = this.normalizeResourceType(params.resourceType, 'raw');

    try {
      const result = await cloudinary.uploader.destroy(params.publicId, {
        resource_type: resourceType,
        invalidate: params.invalidate ?? true,
      });

      const cloudinaryResult = typeof result === 'object' && result && 'result' in result
        ? String((result as { result?: unknown }).result)
        : '';

      if (cloudinaryResult === 'ok' || cloudinaryResult === 'not found') {
        return {
          success: true,
          provider: params.provider,
          publicId: params.publicId,
          result: cloudinaryResult === 'not found' ? 'not_found_treated_as_success' : result,
        };
      }

      return {
        success: false,
        provider: params.provider,
        publicId: params.publicId,
        result,
        error: `Cloudinary returned ${cloudinaryResult || 'unknown result'}.`,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Cloudinary delete failed. publicId=${params.publicId} resourceType=${resourceType} reason=${reason}`);
      return {
        success: false,
        provider: params.provider,
        publicId: params.publicId,
        error: 'Cloudinary delete failed.',
      };
    }
  }

  async deleteAsset(publicId: string, resourceType?: string | null) {
    const result = await this.deleteFile({
      provider: 'cloudinary',
      publicId,
      resourceType,
      invalidate: true,
    });

    if (!result.success) {
      throw new ServiceUnavailableException(result.error ?? 'Cloudinary delete failed.');
    }

    return { skipped: false, result: result.result };
  }

  private buildFolder(input: StorageUploadInput) {
    const parts = [this.rootFolder, this.nodeEnv, input.folder];
    if (input.clientId) parts.push(`client_${input.clientId}`);
    if (input.projectId) parts.push(`project_${input.projectId}`);
    return parts.join('/');
  }

  private normalizeResourceType(value: string | null | undefined, fallback: string) {
    if (value === 'image' || value === 'video' || value === 'raw') return value;
    return fallback;
  }

  private inferResourceType(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension && ['jpg', 'jpeg', 'jfif', 'png', 'webp', 'avif', 'gif', 'svg'].includes(extension)) {
      return 'image';
    }
    if (extension && ['mp4', 'mov', 'webm'].includes(extension)) {
      return 'video';
    }
    return 'raw';
  }
}
