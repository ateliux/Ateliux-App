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
  secureUrl: string;
  folder: string;
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

  signedUrl(publicId: string) {
    return cloudinary.url(publicId, {
      sign_url: true,
      secure: true,
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
            this.logger.error(`Cloudinary upload failed. folder=${folder}`);
            reject(error ?? new Error('Cloudinary upload failed.'));
            return;
          }

          resolve({
            provider: 'cloudinary',
            publicId: result.public_id,
            secureUrl: result.secure_url,
            folder,
          });
        },
      );

      stream.end(input.buffer);
    });
  }

  async deleteAsset(publicId: string) {
    if (!this.configured) {
      this.logger.warn(`Cloudinary delete skipped because provider is not configured. publicId=${publicId}`);
      return { skipped: true };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
      return { skipped: false, result };
    } catch (error) {
      this.logger.error(`Cloudinary delete failed. publicId=${publicId}`);
      throw error;
    }
  }

  private buildFolder(input: StorageUploadInput) {
    const parts = [this.rootFolder, this.nodeEnv, input.folder];
    if (input.clientId) parts.push(`client_${input.clientId}`);
    if (input.projectId) parts.push(`project_${input.projectId}`);
    return parts.join('/');
  }
}
