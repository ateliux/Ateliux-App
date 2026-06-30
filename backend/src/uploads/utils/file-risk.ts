import { FileDownloadMode, FileRiskLevel } from '@prisma/client';

const safePreviewExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.jfif',
  '.png',
  '.webp',
  '.avif',
  '.gif',
  '.pdf',
]);

const downloadOnlyExtensions = new Set([
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
  '.zip',
  '.rar',
  '.7z',
  '.ai',
  '.psd',
  '.fig',
  '.sketch',
  '.mov',
  '.mp4',
]);

const highRiskExtensions = new Set([
  '.svg',
  '.html',
  '.htm',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.xml',
  '.env',
  '.sql',
  '.sh',
  '.bat',
  '.cmd',
  '.exe',
  '.jar',
  '.php',
  '.py',
  '.rb',
]);

const safePreviewMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'application/pdf',
]);

const highRiskMimeTypes = new Set([
  'image/svg+xml',
  'text/html',
  'application/javascript',
  'text/javascript',
  'application/json',
  'application/xml',
  'text/xml',
  'application/x-msdownload',
  'application/x-sh',
]);

export type ClassifiedFileRisk = {
  riskLevel: FileRiskLevel;
  downloadMode: FileDownloadMode;
};

export function classifyFileRisk(input: {
  extension: string;
  mimeType?: string | null;
  detectedMime?: string | null;
}): ClassifiedFileRisk {
  const extension = input.extension.toLowerCase();
  const mimeType = input.mimeType?.toLowerCase() ?? '';
  const detectedMime = input.detectedMime?.toLowerCase() ?? '';

  if (
    highRiskExtensions.has(extension) ||
    highRiskMimeTypes.has(mimeType) ||
    highRiskMimeTypes.has(detectedMime)
  ) {
    return {
      riskLevel: FileRiskLevel.HIGH_RISK_DOWNLOAD_ONLY,
      downloadMode: FileDownloadMode.ATTACHMENT_ONLY,
    };
  }

  if (
    safePreviewExtensions.has(extension) &&
    (!detectedMime || safePreviewMimeTypes.has(detectedMime)) &&
    (!mimeType || safePreviewMimeTypes.has(mimeType))
  ) {
    return {
      riskLevel: FileRiskLevel.SAFE_PREVIEW,
      downloadMode: FileDownloadMode.INLINE_ALLOWED,
    };
  }

  if (downloadOnlyExtensions.has(extension)) {
    return {
      riskLevel: FileRiskLevel.DOWNLOAD_ONLY,
      downloadMode: FileDownloadMode.ATTACHMENT_ONLY,
    };
  }

  return {
    riskLevel: FileRiskLevel.DOWNLOAD_ONLY,
    downloadMode: FileDownloadMode.ATTACHMENT_ONLY,
  };
}
