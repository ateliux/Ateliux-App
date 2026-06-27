import { apiRequest } from "@/lib/api/client";

export type FileAssetStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DELETED";

export type FileAssetDto = {
  id: string;
  clientId?: string;
  projectId?: string;
  originalName: string;
  safeName: string;
  name: string;
  extension: string;
  mimeType: string;
  detectedMime?: string;
  size: number;
  context: string;
  origin: "CLIENT" | "ATELIUX" | "PUBLIC" | "SYSTEM";
  status: FileAssetStatus;
  rejectionReason?: string | null;
  createdAt: string;
};

export type UploadContext = "client_file" | "support_attachment" | "contact_attachment";

export async function uploadSecureFile(input: { file: File; context: UploadContext; projectId?: string }) {
  const body = new FormData();
  body.append("file", input.file);
  body.append("context", input.context);
  if (input.projectId) body.append("projectId", input.projectId);

  return apiRequest<FileAssetDto>("/uploads", {
    method: "POST",
    body,
  });
}

export async function uploadPublicContactAttachment(file: File) {
  const body = new FormData();
  body.append("file", file);
  body.append("context", "contact_attachment");

  return apiRequest<FileAssetDto>("/uploads/public", {
    method: "POST",
    body,
  });
}
