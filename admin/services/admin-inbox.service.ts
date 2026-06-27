import { apiRequest } from "@/lib/api/client";
import type { AdminInboxConversation, AdminInboxPriority, AdminInboxSource, AdminInboxStatus } from "@/types/admin";

type ApiInboxChannel = "CLIENTS" | "SUPPORT";
type ApiInboxStatus = "NEW" | "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "RESOLVED" | "ARCHIVED";
type ApiInboxPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type ApiInboxSource = "PORTAL_CLIENT" | "SUPPORT" | "APPROVAL" | "REQUEST" | "FILE" | "FINANCE" | "SCHEDULE" | "CONTACT";

type ApiInboxMessage = {
  id: string;
  senderId?: string | null;
  senderType: string;
  body: string;
  createdAt: string;
  attachments?: Array<{ id: string; originalName?: string; name: string; size: number; extension?: string }>;
};

type ApiInboxConversation = {
  id: string;
  clientId?: string | null;
  projectId?: string | null;
  channel: ApiInboxChannel;
  status: ApiInboxStatus;
  priority: ApiInboxPriority;
  source: ApiInboxSource;
  subject: string;
  preview?: string | null;
  assignee?: { user?: { name?: string | null } | null } | null;
  client?: { name?: string | null; company?: string | null; email?: string | null } | null;
  project?: { name?: string | null } | null;
  createdAt: string;
  updatedAt: string;
  messages?: ApiInboxMessage[];
};

const statusToUi: Record<ApiInboxStatus, AdminInboxStatus> = {
  NEW: "novo",
  OPEN: "aberto",
  IN_PROGRESS: "em_atendimento",
  WAITING_CLIENT: "aguardando_cliente",
  RESOLVED: "resolvido",
  ARCHIVED: "arquivado",
};

const statusToApi: Record<AdminInboxStatus, ApiInboxStatus> = {
  novo: "NEW",
  aberto: "OPEN",
  em_atendimento: "IN_PROGRESS",
  aguardando_cliente: "WAITING_CLIENT",
  resolvido: "RESOLVED",
  arquivado: "ARCHIVED",
};

const priorityToUi: Record<ApiInboxPriority, AdminInboxPriority> = {
  LOW: "baixa",
  MEDIUM: "media",
  HIGH: "alta",
  URGENT: "urgente",
};

const priorityToApi: Record<AdminInboxPriority, ApiInboxPriority> = {
  baixa: "LOW",
  media: "MEDIUM",
  alta: "HIGH",
  urgente: "URGENT",
};

const sourceToUi: Record<ApiInboxSource, AdminInboxSource> = {
  PORTAL_CLIENT: "portal_cliente",
  SUPPORT: "suporte",
  APPROVAL: "aprovacao",
  REQUEST: "solicitacao",
  FILE: "arquivo",
  FINANCE: "financeiro",
  SCHEDULE: "cronograma",
  CONTACT: "contato",
};

function formatBytes(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function mapAdminInboxConversation(conversation: ApiInboxConversation): AdminInboxConversation {
  return {
    id: conversation.id,
    clientId: conversation.clientId ?? undefined,
    projectId: conversation.projectId ?? undefined,
    channel: conversation.channel === "CLIENTS" ? "clientes" : "suporte",
    clientName: conversation.client?.name ?? conversation.client?.company ?? "Contato publico",
    clientCompany: conversation.client?.company ?? undefined,
    clientEmail: conversation.client?.email ?? "sem-email@ateliux.local",
    projectName: conversation.project?.name ?? undefined,
    subject: conversation.subject,
    preview: conversation.preview ?? "",
    status: statusToUi[conversation.status],
    priority: priorityToUi[conversation.priority],
    unread: conversation.status === "NEW",
    assignedTo: conversation.assignee?.user?.name ?? undefined,
    source: sourceToUi[conversation.source],
    createdAt: formatDate(conversation.createdAt),
    updatedAt: formatDate(conversation.updatedAt),
    messages: (conversation.messages ?? []).map((message) => ({
      id: message.id,
      senderId: message.senderId ?? message.senderType,
      body: message.body,
      createdAt: formatDate(message.createdAt),
      from: message.senderType === "ateliux" ? "ateliux" : message.senderType === "system" ? "sistema" : "cliente",
      attachments: message.attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.originalName ?? attachment.name,
        size: formatBytes(attachment.size),
        type: attachment.extension,
      })),
    })),
  };
}

export async function listAdminInboxConversations() {
  const conversations = await apiRequest<ApiInboxConversation[]>("/admin/inbox/conversations");
  return conversations.map(mapAdminInboxConversation);
}

export async function sendAdminInboxMessage(conversationId: string, body: string) {
  return apiRequest<ApiInboxMessage>(`/admin/inbox/conversations/${conversationId}/messages`, {
    method: "POST",
    json: { body },
  });
}

export async function updateAdminInboxConversation(conversationId: string, patch: Partial<Pick<AdminInboxConversation, "status" | "priority">> & { assigneeId?: string }) {
  return apiRequest<ApiInboxConversation>(`/admin/inbox/conversations/${conversationId}`, {
    method: "PATCH",
    json: {
      status: patch.status ? statusToApi[patch.status] : undefined,
      priority: patch.priority ? priorityToApi[patch.priority] : undefined,
      assigneeId: patch.assigneeId,
    },
  });
}

export async function deleteAdminInboxConversation(conversationId: string) {
  return apiRequest<{ success: boolean }>(`/admin/inbox/conversations/${conversationId}`, {
    method: "DELETE",
  });
}
