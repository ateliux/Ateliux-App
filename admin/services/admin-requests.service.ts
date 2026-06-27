import { apiRequest } from "@/lib/api/client";

export type AdminClientRequestDto = {
  id: string;
  clientId: string;
  projectId?: string | null;
  inboxConversationId?: string | null;
  title: string;
  description: string;
  category?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "NEW" | "IN_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  response?: string | null;
  createdAt: string;
};

export function listAdminClientRequests() {
  return apiRequest<AdminClientRequestDto[]>("/admin/requests");
}

export function createAdminClientRequest(input: {
  clientId: string;
  projectId?: string;
  title: string;
  description: string;
  category?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  return apiRequest<AdminClientRequestDto>("/admin/requests", {
    method: "POST",
    json: input,
  });
}

export function updateAdminClientRequest(id: string, input: Partial<Pick<AdminClientRequestDto, "status" | "priority" | "title" | "description" | "category">>) {
  return apiRequest<AdminClientRequestDto>(`/admin/requests/${id}`, {
    method: "PATCH",
    json: input,
  });
}

export function replyAdminClientRequest(id: string, response: string) {
  return apiRequest<{ success: boolean }>(`/admin/requests/${id}/reply`, {
    method: "POST",
    json: { response },
  });
}

export function convertAdminRequestToStage(id: string) {
  return apiRequest<unknown>(`/admin/requests/${id}/convert-to-stage`, {
    method: "POST",
  });
}
