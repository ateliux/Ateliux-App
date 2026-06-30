import { apiRequest } from "@/lib/api/client";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import {
  PORTAL_CLIENTS,
  PORTAL_FILES_SCOPED,
  PORTAL_PROJECTS_SCOPED,
} from "@/data/admin/admin-mock-data";

export type AdminFileStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DELETED";
export type AdminFileVisibility = "PRIVATE" | "CLIENT_VISIBLE" | "PUBLIC";
export type AdminFileOrigin = "CLIENT" | "ATELIUX" | "PUBLIC" | "SYSTEM";
export type AdminFileRiskLevel = "SAFE_PREVIEW" | "DOWNLOAD_ONLY" | "HIGH_RISK_DOWNLOAD_ONLY";
export type AdminFileDownloadMode = "INLINE_ALLOWED" | "ATTACHMENT_ONLY";
export type AdminFileContext =
  | "AVATAR"
  | "BLOG_COVER"
  | "BLOG_HERO"
  | "CONTACT_ATTACHMENT"
  | "SUPPORT_ATTACHMENT"
  | "CLIENT_FILE"
  | "APPROVAL_ATTACHMENT"
  | "BRIEFING_ATTACHMENT"
  | "FINANCE_RECEIPT"
  | "PREVIEW_ASSET";

export type AdminFileAsset = {
  id: string;
  clientId?: string;
  projectId?: string;
  uploadedById?: string;
  uploadedByType?: "CLIENT" | "ADMIN" | "PUBLIC" | "SYSTEM";
  originalName: string;
  safeName: string;
  name: string;
  extension: string;
  mimeType: string;
  detectedMime?: string;
  size: number;
  storageProvider: string;
  storageKey: string;
  cloudinaryPublicId?: string;
  cloudinaryResourceType?: "image" | "video" | "raw" | string | null;
  secureUrl?: string;
  url?: string;
  origin: AdminFileOrigin;
  context: AdminFileContext;
  visibility: AdminFileVisibility;
  status: AdminFileStatus;
  riskLevel: AdminFileRiskLevel;
  downloadMode: AdminFileDownloadMode;
  rejectionReason?: string | null;
  scanStatus?: "NOT_SCANNED" | "PENDING" | "CLEAN" | "INFECTED" | "FAILED";
  createdAt: string;
  deletedAt?: string | null;
  client?: { id: string; name?: string; company?: string; email?: string } | null;
  project?: { id: string; name?: string } | null;
  uploadedBy?: { id: string; name?: string; email?: string } | null;
};

export type AdminFilesResult = {
  files: AdminFileAsset[];
  source: "api" | "mock";
};

const mockStatuses: AdminFileStatus[] = ["PENDING_REVIEW", "APPROVED", "REJECTED"];
const mockContexts: AdminFileContext[] = ["CLIENT_FILE", "BRIEFING_ATTACHMENT", "SUPPORT_ATTACHMENT"];

function parseSize(size: string) {
  const value = Number.parseInt(size.replace(/\D/g, ""), 10);
  if (size.toLowerCase().includes("mb")) return value * 1024 * 1024;
  return Number.isFinite(value) ? value * 1024 : 0;
}

function fallbackFiles(): AdminFileAsset[] {
  return PORTAL_FILES_SCOPED.map((file, index) => {
    const client = PORTAL_CLIENTS.find((item) => item.id === file.clientId);
    const project = PORTAL_PROJECTS_SCOPED.find((item) => item.id === file.projectId);
    const status = mockStatuses[index % mockStatuses.length];
    return {
      id: file.id,
      clientId: file.clientId,
      projectId: file.projectId,
      uploadedByType: file.origin === "Cliente" ? "CLIENT" : "ADMIN",
      originalName: file.name,
      safeName: `${file.id}-${file.name}`.toLowerCase().replace(/\s+/g, "-"),
      name: file.name,
      extension: `.${file.type.toLowerCase()}`,
      mimeType: file.type === "PDF" ? "application/pdf" : "image/png",
      detectedMime: file.type === "PDF" ? "application/pdf" : "image/png",
      size: parseSize(file.size),
      storageProvider: "mock-cloudinary",
      storageKey: `mock/${file.id}`,
      cloudinaryPublicId: `mock/${file.id}`,
      cloudinaryResourceType: file.type === "PDF" ? "raw" : "image",
      secureUrl: "#",
      url: "#",
      origin: file.origin === "Cliente" ? "CLIENT" : "ATELIUX",
      context: mockContexts[index % mockContexts.length],
      visibility: file.visibleToClient ? "CLIENT_VISIBLE" : "PRIVATE",
      status,
      riskLevel: file.type === "PDF" ? "SAFE_PREVIEW" : "DOWNLOAD_ONLY",
      downloadMode: file.type === "PDF" ? "INLINE_ALLOWED" : "ATTACHMENT_ONLY",
      rejectionReason: status === "REJECTED" ? "Arquivo de demonstracao rejeitado no fallback mockado." : null,
      scanStatus: "NOT_SCANNED",
      createdAt: new Date().toISOString(),
      client,
      project,
      uploadedBy: { id: file.sentBy, name: file.sentBy },
    };
  });
}

export async function listAdminFiles(): Promise<AdminFilesResult> {
  try {
    const files = await apiRequest<AdminFileAsset[]>("/admin/files");
    return { files, source: "api" };
  } catch (error) {
    if (canUseDevFallback("admin/files")) {
      return { files: fallbackFiles(), source: "mock" };
    }
    throw error;
  }
}

export async function createAdminFileAsset(input: {
  clientId?: string;
  projectId?: string;
  name: string;
  mimeType: string;
  size: number;
  storageProvider: string;
  storageKey: string;
  url: string;
  originalName?: string;
  extension?: string;
  origin?: AdminFileOrigin;
  uploadedByType?: "CLIENT" | "ADMIN" | "PUBLIC" | "SYSTEM";
  context?: AdminFileContext;
  visibility?: AdminFileVisibility;
  status?: AdminFileStatus;
  riskLevel?: AdminFileRiskLevel;
  downloadMode?: AdminFileDownloadMode;
}) {
  return apiRequest<AdminFileAsset>("/admin/files", {
    method: "POST",
    json: input,
  });
}

export async function listPendingReviewFiles() {
  return apiRequest<AdminFileAsset[]>("/admin/files/pending-review");
}

export async function approveAdminFile(id: string) {
  return apiRequest<AdminFileAsset>(`/admin/files/${id}/approve`, { method: "POST" });
}

export async function rejectAdminFile(id: string, reason: string) {
  return apiRequest<AdminFileAsset>(`/admin/files/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function deleteAdminFile(id: string) {
  return apiRequest<AdminFileAsset & { success: boolean; storageDeleted: boolean; storageDeleteResult?: unknown }>(`/admin/files/${id}`, { method: "DELETE" });
}

export async function getSignedFileUrl(id: string) {
  return apiRequest<{ url: string; riskLevel: AdminFileRiskLevel; downloadMode: AdminFileDownloadMode }>(`/files/${id}/signed-url`);
}

export async function getAdminFileSignedUrl(id: string) {
  return getSignedFileUrl(id);
}

export async function uploadAdminBlogImage(file: File, context: "blog_cover" | "blog_hero") {
  const body = new FormData();
  body.append("file", file);
  body.append("context", context);

  return apiRequest<AdminFileAsset>("/admin/uploads", {
    method: "POST",
    body,
  });
}

export async function uploadAdminPortalFile(
  file: File,
  input: { context?: "client_file" | "approval_attachment" | "briefing_attachment" | "finance_receipt" | "preview_asset"; clientId: string; projectId?: string },
) {
  const body = new FormData();
  body.append("file", file);
  body.append("context", input.context ?? "client_file");
  body.append("clientId", input.clientId);
  if (input.projectId) body.append("projectId", input.projectId);

  return apiRequest<AdminFileAsset>("/admin/uploads", {
    method: "POST",
    body,
  });
}
