import { FileContext, FileStatus, FileVisibility } from '@prisma/client';

const mb = 1024 * 1024;

export type UploadContext =
  | 'avatar'
  | 'blog_cover'
  | 'contact_attachment'
  | 'support_attachment'
  | 'client_file'
  | 'approval_attachment'
  | 'briefing_attachment'
  | 'finance_receipt'
  | 'preview_asset';

export type UploadPolicy = {
  context: FileContext;
  folder: string;
  maxSizeBytes: number;
  allowedExtensions: readonly string[];
  allowedMimeTypes: readonly string[];
  requiresClientId: boolean;
  requiresProjectId: boolean;
  canBePublic: boolean;
  defaultVisibility: FileVisibility;
  initialStatus: FileStatus;
  allowClientUpload: boolean;
  allowAdminUpload: boolean;
  allowPublicUpload: boolean;
};

export const UPLOAD_POLICIES: Record<UploadContext, UploadPolicy> = {
  avatar: {
    context: FileContext.AVATAR,
    folder: 'avatar',
    maxSizeBytes: 2 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    requiresClientId: false,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.PRIVATE,
    initialStatus: FileStatus.APPROVED,
    allowClientUpload: true,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
  blog_cover: {
    context: FileContext.BLOG_COVER,
    folder: 'blog-cover',
    maxSizeBytes: 5 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    requiresClientId: false,
    requiresProjectId: false,
    canBePublic: true,
    defaultVisibility: FileVisibility.PUBLIC,
    initialStatus: FileStatus.APPROVED,
    allowClientUpload: false,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
  contact_attachment: {
    context: FileContext.CONTACT_ATTACHMENT,
    folder: 'contact-attachment',
    maxSizeBytes: 5 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresClientId: false,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.PRIVATE,
    initialStatus: FileStatus.PENDING_REVIEW,
    allowClientUpload: false,
    allowAdminUpload: true,
    allowPublicUpload: true,
  },
  support_attachment: {
    context: FileContext.SUPPORT_ATTACHMENT,
    folder: 'support-attachment',
    maxSizeBytes: 8 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresClientId: false,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.PRIVATE,
    initialStatus: FileStatus.PENDING_REVIEW,
    allowClientUpload: true,
    allowAdminUpload: true,
    allowPublicUpload: true,
  },
  client_file: {
    context: FileContext.CLIENT_FILE,
    folder: 'client-file',
    maxSizeBytes: 10 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'],
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    requiresClientId: true,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.CLIENT_VISIBLE,
    initialStatus: FileStatus.PENDING_REVIEW,
    allowClientUpload: true,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
  approval_attachment: {
    context: FileContext.APPROVAL_ATTACHMENT,
    folder: 'approval-attachment',
    maxSizeBytes: 10 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresClientId: true,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.CLIENT_VISIBLE,
    initialStatus: FileStatus.PENDING_REVIEW,
    allowClientUpload: true,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
  briefing_attachment: {
    context: FileContext.BRIEFING_ATTACHMENT,
    folder: 'briefing-attachment',
    maxSizeBytes: 10 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'],
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    requiresClientId: true,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.CLIENT_VISIBLE,
    initialStatus: FileStatus.PENDING_REVIEW,
    allowClientUpload: true,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
  finance_receipt: {
    context: FileContext.FINANCE_RECEIPT,
    folder: 'finance-receipt',
    maxSizeBytes: 5 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresClientId: true,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.CLIENT_VISIBLE,
    initialStatus: FileStatus.APPROVED,
    allowClientUpload: false,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
  preview_asset: {
    context: FileContext.PREVIEW_ASSET,
    folder: 'preview-asset',
    maxSizeBytes: 15 * mb,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    requiresClientId: true,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.CLIENT_VISIBLE,
    initialStatus: FileStatus.PENDING_REVIEW,
    allowClientUpload: false,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
};

const configuredGlobalMaxSizeMb = Number(process.env.UPLOAD_MAX_GLOBAL_SIZE_MB ?? 20);

export const MAX_GLOBAL_UPLOAD_SIZE =
  Number.isFinite(configuredGlobalMaxSizeMb) && configuredGlobalMaxSizeMb > 0
    ? configuredGlobalMaxSizeMb * mb
    : Math.max(...Object.values(UPLOAD_POLICIES).map((policy) => policy.maxSizeBytes));

export function isUploadContext(value: string): value is UploadContext {
  return Object.prototype.hasOwnProperty.call(UPLOAD_POLICIES, value);
}
