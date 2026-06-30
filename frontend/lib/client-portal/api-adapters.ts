import type {
  ClientApproval,
  ClientApprovalStatus,
  ClientHistoryItem,
  ClientInvoice,
  ClientPreview,
  ClientProject,
  ClientProjectBlock,
  ClientProjectStage,
  ClientProjectStatus,
  ClientScheduleEvent,
  ClientStageStatus,
  ClientTeamMember,
} from "@/types/client-portal";

type ApiRecord = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asDate(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatApiDate(value: unknown, fallback = "Nao informado") {
  const date = asDate(value);
  return date ? new Intl.DateTimeFormat("pt-BR").format(date) : fallback;
}

export function formatApiTime(value: unknown, fallback = "--:--") {
  const date = asDate(value);
  if (!date) return fallback;
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function toIsoDate(value: unknown) {
  const date = asDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

export function mapProjectStatus(status: unknown): ClientProjectStatus {
  const normalized = asString(status).toUpperCase();
  if (normalized === "COMPLETED") return "completed";
  if (normalized === "WAITING_CLIENT" || normalized === "IN_REVIEW") return "waiting_client";
  if (normalized === "ARCHIVED") return "archived";
  if (normalized === "ACTIVE") return "in_progress";
  return "not_started";
}

export function mapStageStatus(status: unknown): ClientStageStatus {
  const normalized = asString(status).toUpperCase();
  if (normalized === "COMPLETED" || normalized === "APPROVED") return "completed";
  if (normalized === "WAITING_APPROVAL" || normalized === "SENT_TO_CLIENT" || normalized === "CHANGES_REQUESTED") return "waiting_client";
  if (normalized === "ARCHIVED") return "blocked";
  if (normalized === "IN_PROGRESS") return "in_progress";
  return "not_started";
}

export function mapApprovalStatus(status: unknown): ClientApprovalStatus {
  const normalized = asString(status).toUpperCase();
  if (normalized === "APPROVED") return "approved";
  if (normalized === "CHANGES_REQUESTED") return "changes_requested";
  return "pending";
}

function mapPreviewStatus(status: unknown): ClientPreview["status"] {
  const normalized = asString(status).toUpperCase();
  if (normalized === "ARCHIVED") return "unavailable";
  if (normalized === "IN_APPROVAL" || normalized === "SENT") return "in_review";
  return "available";
}

function mapFinanceStatus(status: unknown): ClientInvoice["status"] {
  const normalized = asString(status).toUpperCase();
  if (normalized === "PAID") return "paid";
  if (normalized === "OVERDUE") return "overdue";
  return "pending";
}

function mapHistoryType(entityType: unknown, action: unknown): ClientHistoryItem["type"] {
  const entity = asString(entityType).toLowerCase();
  const event = asString(action).toLowerCase();
  if (entity.includes("approval") || event.includes("approval")) return "approval";
  if (entity.includes("request") || event.includes("request")) return "request";
  if (entity.includes("file") || event.includes("file")) return "file";
  if (entity.includes("deploy") || event.includes("deploy")) return "deployment";
  return "project";
}

function emptyBlocks(scope: string): ClientProjectBlock[] {
  if (!scope) return [];
  return [
    {
      id: 1,
      title: "Escopo principal",
      description: scope,
      status: "in_progress",
    },
  ];
}

export function toClientProject(record: ApiRecord): ClientProject {
  const client = typeof record.client === "object" && record.client ? (record.client as ApiRecord) : {};
  const manager = typeof record.manager === "object" && record.manager ? (record.manager as ApiRecord) : {};
  const managerUser = typeof manager.user === "object" && manager.user ? (manager.user as ApiRecord) : {};
  const scope = asString(record.scope, "Escopo ainda nao publicado.");
  const summary = asString(record.clientFacingSummary, asString(record.description, scope));
  const currentStage = asString(record.currentStage, "Etapa inicial ainda nao publicada");
  const managerName = asString(managerUser.name);
  return {
    id: asNumber(record.numericId, 0) || asString(record.id).length,
    apiId: asString(record.id),
    name: asString(record.name, "Projeto Ateliux"),
    type: asString(record.type, "Projeto digital"),
    plan: asString(record.plan, asString(client.plan, "Sob medida")),
    status: mapProjectStatus(record.status),
    progress: asNumber(record.progress),
    currentStage,
    nextStage: "Proxima etapa definida pela equipe",
    estimatedDeadline: formatApiDate(record.deadline, "Prazo ainda nao publicado"),
    managerId: asNumber(record.managerId, 0),
    briefing: summary,
    objective: summary,
    audience: "Publico e prioridades definidos no briefing do projeto.",
    pages: [],
    features: emptyBlocks(scope),
    integrations: [],
    deliverables: [],
    technologies: [],
    usefulLinks: [],
    notes: [
      managerName ? `Responsavel principal: ${managerName}.` : "Responsavel principal ainda nao vinculado.",
      "Dados carregados da API do Portal do Cliente.",
    ],
  };
}

export function toClientStage(record: ApiRecord, index: number): ClientProjectStage {
  return {
    id: asNumber(record.numericId, index + 1) || index + 1,
    apiId: asString(record.id),
    order: asNumber(record.order, index + 1),
    title: asString(record.title, "Etapa do projeto"),
    description: asString(record.description, "Etapa carregada pela API."),
    status: mapStageStatus(record.status),
    expectedDate: formatApiDate(record.deadline),
    completedDate: mapStageStatus(record.status) === "completed" ? formatApiDate(record.updatedAt) : undefined,
    responsible: asString(record.responsible, "Equipe Ateliux"),
    notes: asString(record.clientStatus, "Acompanhamento disponivel no Portal do Cliente."),
    requiresApproval: Boolean(record.requiresApproval),
  };
}

export function toClientApproval(record: ApiRecord, index: number): ClientApproval {
  const preview = typeof record.preview === "object" && record.preview ? (record.preview as ApiRecord) : null;
  return {
    id: asNumber(record.numericId, index + 1) || index + 1,
    apiId: asString(record.id),
    title: asString(record.title, "Aprovacao"),
    description: asString(record.message, "Entrega enviada para revisao."),
    status: mapApprovalStatus(record.status),
    sentAt: formatApiDate(record.sentAt ?? record.createdAt),
    responsible: "Equipe Ateliux",
    previewLabel: asString(preview?.title, asString(record.type, "Abrir previa")),
    comment: asString(record.clientComment),
  };
}

export function toClientPreview(record: ApiRecord, index: number): ClientPreview {
  return {
    id: asNumber(record.numericId, index + 1) || index + 1,
    apiId: asString(record.id),
    page: asString(record.title, "Preview"),
    status: mapPreviewStatus(record.status),
    updatedAt: formatApiDate(record.updatedAt ?? record.sentAt ?? record.createdAt),
    url: asString(record.url),
    comments: [],
  };
}

export function toClientScheduleEvent(record: ApiRecord, index: number): ClientScheduleEvent {
  const apiType = asString(record.type).toLowerCase();
  const type = ["meeting", "delivery", "approval", "development", "publication"].includes(apiType) ? apiType : "development";
  return {
    id: asNumber(record.numericId, index + 1) || index + 1,
    apiId: asString(record.id),
    title: asString(record.title, "Evento do projeto"),
    date: toIsoDate(record.date),
    time: asString(record.time, formatApiTime(record.date)),
    type: type as ClientScheduleEvent["type"],
    description: asString(record.notes, "Evento carregado pela API."),
    responsible: asString(record.responsible, "Equipe Ateliux"),
  };
}

export function toClientInvoice(record: ApiRecord, index: number): ClientInvoice {
  return {
    id: asNumber(record.numericId, index + 1) || index + 1,
    apiId: asString(record.id),
    label: asString(record.installment, asString(record.description, `Parcela ${index + 1}`)),
    dueDate: formatApiDate(record.dueDate),
    amount: asNumber(record.amount),
    status: mapFinanceStatus(record.status),
    paidAt: mapFinanceStatus(record.status) === "paid" ? formatApiDate(record.updatedAt) : undefined,
  };
}

export function toClientHistoryItem(record: ApiRecord, index: number): ClientHistoryItem {
  const metadata = typeof record.metadata === "object" && record.metadata ? (record.metadata as ApiRecord) : {};
  const actor = asString(metadata.responsibleName, asString(record.actorType, "Ateliux"));
  return {
    id: asNumber(record.numericId, index + 1) || index + 1,
    apiId: asString(record.id),
    date: formatApiDate(record.createdAt),
    time: formatApiTime(record.createdAt),
    type: mapHistoryType(record.entityType, record.action),
    title: asString(metadata.title, asString(record.action, "Atualizacao registrada")),
    description: asString(metadata.description, "Registro carregado pela API."),
    responsible: actor,
    status: asString(record.entityType, "Historico"),
  };
}

export type ClientNotificationItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  read: boolean;
};

export function hrefForClientNotification(item: ApiRecord) {
  const entityType = asString(item.entityType).toLowerCase();
  const type = asString(item.type).toLowerCase();
  const combined = `${entityType} ${type}`;
  if (combined.includes("approval")) return "/cliente/aprovacoes";
  if (combined.includes("request")) return "/cliente/solicitacoes";
  if (combined.includes("file")) return "/cliente/arquivos";
  if (combined.includes("finance")) return "/cliente/financeiro";
  if (combined.includes("schedule")) return "/cliente/cronograma";
  if (combined.includes("support")) return "/cliente/suporte";
  return "/cliente/historico";
}

export function toClientNotificationItem(record: ApiRecord): ClientNotificationItem {
  return {
    id: asString(record.id, crypto.randomUUID()),
    title: asString(record.title, "Notificacao"),
    detail: asString(record.body, "Atualizacao disponivel no Portal do Cliente."),
    href: hrefForClientNotification(record),
    read: Boolean(record.readAt),
  };
}

function roleLabel(role: string) {
  const normalized = role.toUpperCase();
  if (normalized.includes("PROJECT_MANAGER")) return "Gestao de projeto";
  if (normalized.includes("SUPPORT")) return "Suporte ao cliente";
  if (normalized.includes("FINANCE")) return "Financeiro";
  if (normalized.includes("DESIGNER")) return "Design e desenvolvimento";
  if (normalized.includes("EDITOR")) return "Conteudo";
  if (normalized.includes("ADMIN")) return "Responsavel Ateliux";
  return role || "Equipe Ateliux";
}

export function toClientTeamMember(record: ApiRecord, index: number): ClientTeamMember {
  const areas = Array.isArray(record.areas) ? record.areas.map((item) => asString(item)).filter(Boolean) : [];
  const projectName = asString(record.projectName);
  const role = roleLabel(asString(record.role));
  return {
    id: index + 1,
    apiId: asString(record.id),
    name: asString(record.name, "Equipe Ateliux"),
    email: asString(record.email),
    role,
    avatar: asString(record.avatarUrl),
    responsibilities: [
      projectName ? `Acompanha o projeto ${projectName}.` : "Acompanha o relacionamento com o cliente.",
      areas.length ? `Atua em: ${areas.join(", ")}.` : `Responsavel por ${role.toLowerCase()}.`,
    ],
    status: "available",
    contactLabel: asString(record.email, "Contato via suporte do portal"),
    projectName,
    areas,
  };
}
