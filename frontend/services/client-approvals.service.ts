import { apiRequest } from "@/lib/api/client";

export function listClientApprovals<T = unknown>() {
  return apiRequest<T[]>("/client/approvals");
}

export function approveClientApproval<T = unknown>(id: string, clientComment?: string) {
  return apiRequest<T>(`/client/approvals/${id}/approve`, {
    method: "POST",
    json: { clientComment },
  });
}

export function requestClientApprovalChanges<T = unknown>(id: string, clientComment: string) {
  return apiRequest<T>(`/client/approvals/${id}/request-changes`, {
    method: "POST",
    json: { clientComment },
  });
}
