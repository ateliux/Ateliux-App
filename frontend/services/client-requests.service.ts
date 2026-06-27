import { apiRequest } from "@/lib/api/client";
import type { ClientPriority, ClientRequest, ClientRequestStatus } from "@/types/client-portal";

type ApiPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type ApiRequestStatus = "NEW" | "IN_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

type ApiFileAttachment = {
  id: string;
  originalName?: string;
  name: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DELETED";
};

type ApiClientRequest = {
  id: string;
  title: string;
  description: string;
  category?: string | null;
  priority?: ApiPriority | null;
  status: ApiRequestStatus;
  response?: string | null;
  createdAt: string;
  inboxConversation?: {
    messages?: Array<{
      senderType?: string;
      body?: string;
      attachments?: ApiFileAttachment[];
    }>;
  } | null;
};

const priorityToApi: Record<ClientPriority, ApiPriority> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

const priorityFromApi: Record<ApiPriority, ClientPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "high",
};

function statusFromApi(status: ApiRequestStatus, response?: string | null): ClientRequestStatus {
  if (status === "ARCHIVED") return "cancelled";
  if (response || status === "COMPLETED") return "answered";
  if (status === "IN_REVIEW" || status === "IN_PROGRESS") return "in_review";
  return "open";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function normalizeCategory(value?: string | null): ClientRequest["category"] {
  const allowed = ["design", "text", "feature", "image", "deadline", "other"];
  return allowed.includes(value ?? "") ? (value as ClientRequest["category"]) : "other";
}

function mapAttachmentStatus(status: ApiFileAttachment["status"]): ClientRequest["attachmentStatus"] {
  const map = {
    PENDING_REVIEW: "pending_review",
    APPROVED: "approved",
    REJECTED: "rejected",
    DELETED: "deleted",
  } as const;
  return map[status];
}

export function mapClientRequest(request: ApiClientRequest): ClientRequest {
  const firstAttachment = request.inboxConversation?.messages?.flatMap((message) => message.attachments ?? [])[0];
  const lastAteliuxMessage = request.inboxConversation?.messages
    ?.filter((message) => message.senderType === "ateliux" && message.body)
    .at(-1);

  return {
    id: request.id,
    title: request.title,
    category: normalizeCategory(request.category),
    description: request.description,
    priority: request.priority ? priorityFromApi[request.priority] : "medium",
    status: statusFromApi(request.status, request.response),
    createdAt: formatDate(request.createdAt),
    response: request.response ?? lastAteliuxMessage?.body ?? undefined,
    attachmentName: firstAttachment?.originalName ?? firstAttachment?.name,
    attachmentFileAssetId: firstAttachment?.id,
    attachmentStatus: firstAttachment ? mapAttachmentStatus(firstAttachment.status) : undefined,
  };
}

export async function listClientRequests() {
  const requests = await apiRequest<ApiClientRequest[]>("/client/requests");
  return requests.map(mapClientRequest);
}

export async function createClientRequest(input: {
  title: string;
  category: ClientRequest["category"];
  description: string;
  priority: ClientPriority;
  projectId?: string;
  fileAssetIds?: string[];
}) {
  const request = await apiRequest<ApiClientRequest>("/client/requests", {
    method: "POST",
    json: {
      title: input.title,
      category: input.category,
      description: input.description,
      priority: priorityToApi[input.priority],
      projectId: input.projectId,
      fileAssetIds: input.fileAssetIds,
    },
  });

  return mapClientRequest(request);
}
