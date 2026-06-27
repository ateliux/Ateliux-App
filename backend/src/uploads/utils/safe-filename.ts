import { randomUUID } from 'node:crypto';
import path from 'node:path';

export type SafeFileName = {
  originalName: string;
  safeName: string;
  extension: string;
};

export function buildSafeFileName(originalName: string): SafeFileName {
  const normalizedOriginal = originalName || 'upload';
  const extension = path.extname(normalizedOriginal).toLowerCase();
  const base = path
    .basename(normalizedOriginal, extension)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const fallback = base || 'file';
  const safeName = `${fallback}_${randomUUID()}${extension}`;

  return {
    originalName: normalizedOriginal,
    safeName,
    extension,
  };
}
