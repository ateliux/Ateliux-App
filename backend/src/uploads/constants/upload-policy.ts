import { FileContext, FileStatus, FileVisibility } from '@prisma/client';

const mb = 1024 * 1024;
const configuredGlobalMaxSizeMb = Number(process.env.UPLOAD_MAX_GLOBAL_SIZE_MB ?? 100);
const configuredAdminMaxSizeMb = Number(process.env.ADMIN_UPLOAD_MAX_SIZE_MB ?? 100);
const configuredBlogImageMaxSizeMb = Number(process.env.BLOG_IMAGE_UPLOAD_MAX_SIZE_MB ?? 8);

const configuredGlobalMaxSizeBytes =
  Number.isFinite(configuredGlobalMaxSizeMb) && configuredGlobalMaxSizeMb > 0
    ? configuredGlobalMaxSizeMb * mb
    : 100 * mb;

const adminUploadMaxSizeBytes =
  Number.isFinite(configuredAdminMaxSizeMb) && configuredAdminMaxSizeMb > 0
    ? Math.min(configuredAdminMaxSizeMb * mb, configuredGlobalMaxSizeBytes)
    : configuredGlobalMaxSizeBytes;

const blogImageUploadMaxSizeBytes =
  Number.isFinite(configuredBlogImageMaxSizeMb) && configuredBlogImageMaxSizeMb > 0
    ? Math.min(configuredBlogImageMaxSizeMb * mb, configuredGlobalMaxSizeBytes)
    : Math.min(8 * mb, configuredGlobalMaxSizeBytes);

const restrictedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'] as const;
const restrictedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
const restrictedDocumentExtensions = ['.pdf', '.doc', '.docx'] as const;
const restrictedDocumentMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
const adminBlogImageExtensions = ['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.avif', '.gif'] as const;
const adminBlogImageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const;

export type UploadContext =
  | 'avatar'
  | 'blog_cover'
  | 'blog_hero'
  | 'contact_attachment'
  | 'support_attachment'
  | 'client_file'
  | 'approval_attachment'
  | 'briefing_attachment'
  | 'finance_receipt'
  | 'preview_asset';

export type UploadPolicyMode = 'restricted' | 'admin';

export type UploadActorPolicy = {
  mode: UploadPolicyMode;
  allowedExtensions: readonly string[] | null;
  allowedMimeTypes: readonly string[] | null;
  blockKnownDangerousExtensions: boolean;
  requireDetectedMime: boolean;
  allowUnknownDetectedMime: boolean;
};

export type UploadPolicy = {
  context: FileContext;
  folder: string;
  maxSizeBytes: number;
  inboundMaxSizeBytes: number;
  adminMaxSizeBytes: number;
  inboundPolicy: UploadActorPolicy;
  adminPolicy: UploadActorPolicy;
  requiresClientId: boolean;
  requiresProjectId: boolean;
  canBePublic: boolean;
  defaultVisibility: FileVisibility;
  initialStatus: FileStatus;
  allowClientUpload: boolean;
  allowAdminUpload: boolean;
  allowPublicUpload: boolean;
};

export const CLIENT_UPLOAD_POLICY: UploadActorPolicy = {
  mode: 'restricted',
  allowedExtensions: [...restrictedImageExtensions, ...restrictedDocumentExtensions],
  allowedMimeTypes: [...restrictedImageMimeTypes, ...restrictedDocumentMimeTypes],
  blockKnownDangerousExtensions: true,
  requireDetectedMime: true,
  allowUnknownDetectedMime: false,
};

export const CLIENT_IMAGE_UPLOAD_POLICY: UploadActorPolicy = {
  mode: 'restricted',
  allowedExtensions: restrictedImageExtensions,
  allowedMimeTypes: restrictedImageMimeTypes,
  blockKnownDangerousExtensions: true,
  requireDetectedMime: true,
  allowUnknownDetectedMime: false,
};

export const CLIENT_IMAGE_PDF_UPLOAD_POLICY: UploadActorPolicy = {
  mode: 'restricted',
  allowedExtensions: [...restrictedImageExtensions, '.pdf'],
  allowedMimeTypes: [...restrictedImageMimeTypes, 'application/pdf'],
  blockKnownDangerousExtensions: true,
  requireDetectedMime: true,
  allowUnknownDetectedMime: false,
};

export const ADMIN_GENERAL_UPLOAD_POLICY: UploadActorPolicy = {
  mode: 'admin',
  allowedExtensions: null,
  allowedMimeTypes: null,
  blockKnownDangerousExtensions: false,
  requireDetectedMime: false,
  allowUnknownDetectedMime: true,
};

export const ADMIN_IMAGE_UPLOAD_POLICY: UploadActorPolicy = {
  mode: 'admin',
  allowedExtensions: adminBlogImageExtensions,
  allowedMimeTypes: adminBlogImageMimeTypes,
  blockKnownDangerousExtensions: false,
  requireDetectedMime: true,
  allowUnknownDetectedMime: false,
};

export const ADMIN_AVATAR_UPLOAD_POLICY: UploadActorPolicy = {
  mode: 'admin',
  allowedExtensions: restrictedImageExtensions,
  allowedMimeTypes: restrictedImageMimeTypes,
  blockKnownDangerousExtensions: false,
  requireDetectedMime: true,
  allowUnknownDetectedMime: false,
};

export const CLIENT_UPLOAD_POLICIES = {
  avatar: CLIENT_IMAGE_UPLOAD_POLICY,
  contact_attachment: CLIENT_IMAGE_PDF_UPLOAD_POLICY,
  support_attachment: CLIENT_IMAGE_PDF_UPLOAD_POLICY,
  client_file: CLIENT_UPLOAD_POLICY,
  approval_attachment: CLIENT_IMAGE_PDF_UPLOAD_POLICY,
  briefing_attachment: CLIENT_UPLOAD_POLICY,
} as const;

export const ADMIN_UPLOAD_POLICIES = {
  avatar: ADMIN_AVATAR_UPLOAD_POLICY,
  blog_cover: ADMIN_IMAGE_UPLOAD_POLICY,
  blog_hero: ADMIN_IMAGE_UPLOAD_POLICY,
  support_attachment: ADMIN_GENERAL_UPLOAD_POLICY,
  client_file: ADMIN_GENERAL_UPLOAD_POLICY,
  approval_attachment: ADMIN_GENERAL_UPLOAD_POLICY,
  briefing_attachment: ADMIN_GENERAL_UPLOAD_POLICY,
  finance_receipt: ADMIN_GENERAL_UPLOAD_POLICY,
  preview_asset: ADMIN_GENERAL_UPLOAD_POLICY,
} as const;

export const UPLOAD_POLICIES: Record<UploadContext, UploadPolicy> = {
  avatar: {
    context: FileContext.AVATAR,
    folder: 'avatar',
    maxSizeBytes: 2 * mb,
    inboundMaxSizeBytes: 2 * mb,
    adminMaxSizeBytes: 2 * mb,
    inboundPolicy: CLIENT_UPLOAD_POLICIES.avatar,
    adminPolicy: ADMIN_UPLOAD_POLICIES.avatar,
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
    maxSizeBytes: blogImageUploadMaxSizeBytes,
    inboundMaxSizeBytes: 5 * mb,
    adminMaxSizeBytes: blogImageUploadMaxSizeBytes,
    inboundPolicy: CLIENT_IMAGE_UPLOAD_POLICY,
    adminPolicy: ADMIN_UPLOAD_POLICIES.blog_cover,
    requiresClientId: false,
    requiresProjectId: false,
    canBePublic: true,
    defaultVisibility: FileVisibility.PUBLIC,
    initialStatus: FileStatus.APPROVED,
    allowClientUpload: false,
    allowAdminUpload: true,
    allowPublicUpload: false,
  },
  blog_hero: {
    context: FileContext.BLOG_HERO,
    folder: 'blog-hero',
    maxSizeBytes: blogImageUploadMaxSizeBytes,
    inboundMaxSizeBytes: 8 * mb,
    adminMaxSizeBytes: blogImageUploadMaxSizeBytes,
    inboundPolicy: CLIENT_IMAGE_UPLOAD_POLICY,
    adminPolicy: ADMIN_UPLOAD_POLICIES.blog_hero,
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
    inboundMaxSizeBytes: 5 * mb,
    adminMaxSizeBytes: 5 * mb,
    inboundPolicy: CLIENT_UPLOAD_POLICIES.contact_attachment,
    adminPolicy: ADMIN_GENERAL_UPLOAD_POLICY,
    requiresClientId: false,
    requiresProjectId: false,
    canBePublic: false,
    defaultVisibility: FileVisibility.PRIVATE,
    initialStatus: FileStatus.PENDING_REVIEW,
    allowClientUpload: false,
    allowAdminUpload: false,
    allowPublicUpload: true,
  },
  support_attachment: {
    context: FileContext.SUPPORT_ATTACHMENT,
    folder: 'support-attachment',
    maxSizeBytes: adminUploadMaxSizeBytes,
    inboundMaxSizeBytes: 8 * mb,
    adminMaxSizeBytes: adminUploadMaxSizeBytes,
    inboundPolicy: CLIENT_UPLOAD_POLICIES.support_attachment,
    adminPolicy: ADMIN_UPLOAD_POLICIES.support_attachment,
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
    maxSizeBytes: adminUploadMaxSizeBytes,
    inboundMaxSizeBytes: 10 * mb,
    adminMaxSizeBytes: adminUploadMaxSizeBytes,
    inboundPolicy: CLIENT_UPLOAD_POLICIES.client_file,
    adminPolicy: ADMIN_UPLOAD_POLICIES.client_file,
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
    maxSizeBytes: adminUploadMaxSizeBytes,
    inboundMaxSizeBytes: 10 * mb,
    adminMaxSizeBytes: adminUploadMaxSizeBytes,
    inboundPolicy: CLIENT_UPLOAD_POLICIES.approval_attachment,
    adminPolicy: ADMIN_UPLOAD_POLICIES.approval_attachment,
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
    maxSizeBytes: adminUploadMaxSizeBytes,
    inboundMaxSizeBytes: 10 * mb,
    adminMaxSizeBytes: adminUploadMaxSizeBytes,
    inboundPolicy: CLIENT_UPLOAD_POLICIES.briefing_attachment,
    adminPolicy: ADMIN_UPLOAD_POLICIES.briefing_attachment,
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
    maxSizeBytes: Math.min(20 * mb, configuredGlobalMaxSizeBytes),
    inboundMaxSizeBytes: 5 * mb,
    adminMaxSizeBytes: Math.min(20 * mb, configuredGlobalMaxSizeBytes),
    inboundPolicy: CLIENT_IMAGE_PDF_UPLOAD_POLICY,
    adminPolicy: ADMIN_UPLOAD_POLICIES.finance_receipt,
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
    maxSizeBytes: adminUploadMaxSizeBytes,
    inboundMaxSizeBytes: 15 * mb,
    adminMaxSizeBytes: adminUploadMaxSizeBytes,
    inboundPolicy: CLIENT_IMAGE_PDF_UPLOAD_POLICY,
    adminPolicy: ADMIN_UPLOAD_POLICIES.preview_asset,
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

export const MAX_GLOBAL_UPLOAD_SIZE = configuredGlobalMaxSizeBytes;

export function isUploadContext(value: string): value is UploadContext {
  return Object.prototype.hasOwnProperty.call(UPLOAD_POLICIES, value);
}
