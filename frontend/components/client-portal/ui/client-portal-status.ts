import type { ClientApprovalStatus, ClientPortalBadgeVariant, ClientProjectStatus, ClientRequestStatus, ClientStageStatus, ClientTicketStatus } from "@/types/client-portal";

export const projectStatusLabel: Record<ClientProjectStatus, string> = { not_started: "Nao iniciado", in_progress: "Em andamento", waiting_client: "Aguardando cliente", completed: "Concluido", blocked: "Bloqueado", archived: "Arquivado" };
export const stageStatusLabel: Record<ClientStageStatus, string> = { not_started: "Nao iniciado", in_progress: "Em andamento", waiting_client: "Aguardando cliente", completed: "Concluido", blocked: "Bloqueado" };
export const approvalStatusLabel: Record<ClientApprovalStatus, string> = { pending: "Pendente", approved: "Aprovado", changes_requested: "Ajustes solicitados" };
export const requestStatusLabel: Record<ClientRequestStatus, string> = { open: "Aberta", in_review: "Em analise", answered: "Respondida", cancelled: "Cancelada" };
export const ticketStatusLabel: Record<ClientTicketStatus, string> = { open: "Aberto", answered: "Respondido", waiting_client: "Aguardando cliente", closed: "Encerrado" };

export const statusVariant = (status: string): ClientPortalBadgeVariant => {
  if (["completed", "approved", "answered", "paid", "available"].includes(status)) return "success";
  if (["waiting_client", "pending", "in_review", "in_progress"].includes(status)) return "warning";
  if (["blocked", "overdue", "changes_requested"].includes(status)) return "danger";
  if (["open"].includes(status)) return "info";
  return "neutral";
};
