import { apiRequest } from "@/lib/api/client";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { clientFiles as fallbackClientFiles } from "@/data/client-portal/client-portal-mock-data";
import type { ClientFile } from "@/types/client-portal";
import { uploadSecureFile, type FileAssetDto } from "./uploads.service";

export type ClientFilesResult = {
  files: ClientFile[];
  source: "api" | "mock";
};

function formatBytes(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function mapFileAssetToClientFile(asset: FileAssetDto): ClientFile {
  const statusMap: Record<FileAssetDto["status"], ClientFile["status"]> = {
    PENDING_REVIEW: "pending_review",
    APPROVED: "approved",
    REJECTED: "rejected",
    DELETED: "deleted",
  };

  return {
    id: asset.id,
    fileAssetId: asset.id,
    name: asset.originalName || asset.name,
    type: asset.extension ? asset.extension.replace(".", "").toUpperCase() : asset.mimeType,
    origin: asset.origin === "CLIENT" ? "Cliente" : "Ateliux",
    date: new Date(asset.createdAt).toLocaleDateString("pt-BR"),
    size: formatBytes(asset.size),
    status: statusMap[asset.status],
    riskLevel: asset.riskLevel,
    downloadMode: asset.downloadMode,
    context: asset.context,
    projectId: asset.projectId,
    rejectionReason: asset.rejectionReason,
  };
}

export async function listClientFiles(): Promise<ClientFilesResult> {
  try {
    const assets = await apiRequest<FileAssetDto[]>("/client/files");
    return { files: assets.map(mapFileAssetToClientFile), source: "api" };
  } catch (error) {
    if (canUseDevFallback("frontend/client-files")) {
      return { files: fallbackClientFiles, source: "mock" };
    }
    throw error;
  }
}

export async function uploadClientFile(file: File, projectId?: string) {
  const asset = await uploadSecureFile({ file, projectId, context: "client_file" });
  return mapFileAssetToClientFile(asset);
}

export async function uploadSupportAttachment(file: File) {
  const asset = await uploadSecureFile({ file, context: "support_attachment" });
  return mapFileAssetToClientFile(asset);
}

export async function uploadClientRequestAttachment(file: File) {
  const asset = await uploadSecureFile({ file, context: "client_file" });
  return mapFileAssetToClientFile(asset);
}

export async function getClientFileSignedUrl(fileAssetId: string) {
  return apiRequest<{ url: string; riskLevel: FileAssetDto["riskLevel"]; downloadMode: FileAssetDto["downloadMode"] }>(`/files/${fileAssetId}/signed-url`);
}
