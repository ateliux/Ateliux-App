import { apiRequest } from "@/lib/api/client";
import type { ClientPriority, ClientSupportTicket, ClientTicketStatus } from "@/types/client-portal";

type ApiPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type ApiInboxStatus = "NEW" | "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "RESOLVED" | "ARCHIVED";

type ApiFileAttachment = {
  id: string;
  originalName?: string;
  name: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DELETED";
};

type ApiInboxMessage = {
  id: string;
  senderType: string;
  body: string;
  createdAt: string;
  attachments?: ApiFileAttachment[];
};

type ApiSupportTicket = {
  id: string;
  subject: string;
  category: string;
  priority?: ApiPriority | null;
  status: ApiInboxStatus;
  updatedAt: string;
  inboxConversation?: {
    messages?: ApiInboxMessage[];
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

const statusFromApi: Record<ApiInboxStatus, ClientTicketStatus> = {
  NEW: "open",
  OPEN: "open",
  IN_PROGRESS: "open",
  WAITING_CLIENT: "waiting_client",
  RESOLVED: "closed",
  ARCHIVED: "closed",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function mapAttachmentStatus(status: ApiFileAttachment["status"]): ClientSupportTicket["attachmentStatus"] {
  const map = {
    PENDING_REVIEW: "pending_review",
    APPROVED: "approved",
    REJECTED: "rejected",
    DELETED: "deleted",
  } as const;
  return map[status];
}

export function mapSupportTicket(ticket: ApiSupportTicket): ClientSupportTicket {
  const messages = ticket.inboxConversation?.messages ?? [];
  const firstAttachment = messages.flatMap((message) => message.attachments ?? [])[0];

  return {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority ? priorityFromApi[ticket.priority] : "medium",
    status: statusFromApi[ticket.status],
    updatedAt: formatDate(ticket.updatedAt),
    attachmentName: firstAttachment?.originalName ?? firstAttachment?.name,
    attachmentFileAssetId: firstAttachment?.id,
    attachmentStatus: firstAttachment ? mapAttachmentStatus(firstAttachment.status) : undefined,
    messages: messages.map((message) => ({
      id: message.id,
      author: message.senderType === "ateliux" ? "Ateliux" : "Cliente",
      message: message.body,
      sentAt: formatDate(message.createdAt),
    })),
  };
}

export async function listClientSupportTickets() {
  const tickets = await apiRequest<ApiSupportTicket[]>("/client/support/tickets");
  return tickets.map(mapSupportTicket);
}

export async function createClientSupportTicket(input: {
  subject: string;
  category: string;
  priority: ClientPriority;
  message: string;
  fileAssetIds?: string[];
}) {
  const ticket = await apiRequest<ApiSupportTicket>("/client/support/tickets", {
    method: "POST",
    json: {
      subject: input.subject,
      category: input.category,
      priority: priorityToApi[input.priority],
      message: input.message,
      fileAssetIds: input.fileAssetIds,
    },
  });

  return mapSupportTicket(ticket);
}

export async function replyClientSupportTicket(ticketId: string | number, message: string) {
  return apiRequest<ApiInboxMessage>(`/client/support/tickets/${ticketId}/messages`, {
    method: "POST",
    json: { body: message },
  });
}

export async function closeClientSupportTicket(ticketId: string | number) {
  const ticket = await apiRequest<ApiSupportTicket>(`/client/support/tickets/${ticketId}/close`, {
    method: "POST",
  });
  return mapSupportTicket(ticket);
}
