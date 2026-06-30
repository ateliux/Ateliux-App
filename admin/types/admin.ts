import type { LucideIcon } from "lucide-react";

export type AdminView =
  | "Painel"
  | "Caixa de Entrada"
  | "Calendario"
  | "Funcionarios"
  | "Desempenho"
  | "Folha de Pagamento"
  | "Licencas"
  | "Recrutamento";

export type BadgeVariant = "green" | "yellow" | "red" | "gray" | "blue";

export type CalendarCategory = "talent" | "development" | "engagement" | "general";

export type AdminUser = {
  id: number;
  name: string;
  role: string;
  avatar: string;
};

export type InboxMessage = {
  id: number;
  sender: AdminUser;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
};

export type AdminInboxChannel = "clientes" | "suporte";

export type AdminInboxStatus = "novo" | "aberto" | "em_atendimento" | "aguardando_cliente" | "resolvido" | "arquivado";

export type AdminInboxPriority = "baixa" | "media" | "alta" | "urgente";

export type AdminInboxSource = "portal_cliente" | "suporte" | "aprovacao" | "solicitacao" | "arquivo" | "financeiro" | "cronograma" | "contato";

export type AdminInboxAttachment = {
  id: string;
  name: string;
  originalName?: string;
  extension?: string;
  mimeType?: string;
  size: string;
  sizeBytes: number;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DELETED";
  riskLevel: "SAFE_PREVIEW" | "DOWNLOAD_ONLY" | "HIGH_RISK_DOWNLOAD_ONLY";
  downloadMode: "INLINE_ALLOWED" | "ATTACHMENT_ONLY";
  context: string;
  uploadedByType: string;
  origin?: string;
  rejectionReason?: string | null;
};

export type AdminInboxMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  from: "cliente" | "ateliux" | "sistema";
  attachments?: readonly AdminInboxAttachment[];
};

export type AdminInboxConversation = {
  id: string;
  clientId?: string;
  projectId?: string;
  channel: AdminInboxChannel;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientAvatarUrl?: string;
  projectName?: string;
  subject: string;
  preview: string;
  status: AdminInboxStatus;
  priority: AdminInboxPriority;
  unread: boolean;
  assignedTo?: string;
  source: AdminInboxSource;
  createdAt: string;
  updatedAt: string;
  messages: readonly AdminInboxMessage[];
};

export type ClientScopedEntity = {
  id: string;
  clientId: string;
  projectId?: string;
};

export type PortalClientStatus = "Ativa" | "Aguardando convite" | "Inativa";

export type PortalClientRecord = {
  id: string;
  name: string;
  company: string;
  email: string;
  plan: "Essencial" | "Profissional" | "Enterprise";
  accountStatus: PortalClientStatus;
  responsible: string;
  lastActivity: string;
  activeProjectId?: string;
};

export type PortalProjectStatus = "Rascunho interno" | "Em producao" | "Enviado ao cliente" | "Aguardando cliente" | "Concluido" | "Arquivado";

export type PortalProjectRecord = ClientScopedEntity & {
  projectId?: never;
  name: string;
  type: string;
  scope: string;
  status: PortalProjectStatus;
  progress: number;
  responsible: string;
  deadline: string;
  currentStage: string;
  visibleToClient: boolean;
};

export type PortalBriefingStatus = "Rascunho interno" | "Enviado ao cliente" | "Respondido" | "Em analise" | "Concluido" | "Arquivado";

export type PortalBriefingRecord = ClientScopedEntity & {
  title: string;
  type: string;
  description: string;
  status: PortalBriefingStatus;
  createdBy: string;
  sentTo: string;
  createdAt: string;
  sentAt?: string;
  visibleToClient: boolean;
  clientResponse?: string;
};

export type PortalClientStageStatus =
  | "Rascunho interno"
  | "Em producao"
  | "Pronta para envio"
  | "Enviada ao cliente"
  | "Aguardando aprovacao"
  | "Ajustes solicitados"
  | "Aprovada"
  | "Concluida";

export type PortalClientStageRecord = ClientScopedEntity & {
  name: string;
  responsible: string;
  internalStatus: PortalClientStageStatus;
  clientStatus: string;
  sentToClient: boolean;
  approvalPending: boolean;
  deadline: string;
  lastUpdate: string;
};

export type PortalClientApprovalStatus = "Rascunho" | "Enviado" | "Aguardando cliente" | "Aprovado" | "Ajustes solicitados" | "Reenviado" | "Cancelado";

export type PortalClientApprovalRecord = ClientScopedEntity & {
  title: string;
  type: string;
  previewUrl: string;
  message: string;
  sentBy: string;
  sentTo: string;
  status: PortalClientApprovalStatus;
  clientResponse?: string;
  sentAt?: string;
};

export type PortalClientRequestStatus = "Nova" | "Em analise" | "Em execucao" | "Concluida" | "Arquivada";

export type PortalClientRequestRecord = ClientScopedEntity & {
  origin: "Portal do Cliente" | "Caixa de Entrada" | "Suporte";
  title: string;
  description: string;
  priority: SupportPriority;
  status: PortalClientRequestStatus;
  sentBy: string;
  responsible: string;
  createdAt: string;
  inboxConversationId: string;
};

export type PortalClientFileRecord = ClientScopedEntity & {
  name: string;
  type: string;
  origin: "Ateliux" | "Cliente";
  sentBy: string;
  sentTo: string;
  visibleToClient: boolean;
  linkedTo: string;
  size: string;
  createdAt: string;
};

export type PortalClientPreviewStatus = "Rascunho" | "Enviado" | "Em aprovacao" | "Aprovado" | "Arquivado";

export type PortalClientPreviewRecord = ClientScopedEntity & {
  title: string;
  url: string;
  status: PortalClientPreviewStatus;
  version: string;
  createdAt: string;
  sentAt?: string;
};

export type PortalClientScheduleStatus = "Interno" | "Visivel no portal" | "Reagendado" | "Concluido" | "Cancelado";

export type PortalClientScheduleRecord = ClientScopedEntity & {
  title: string;
  type: "Reuniao" | "Entrega" | "Aprovacao" | "Publicacao";
  date: string;
  time: string;
  responsible: string;
  visibleToClient: boolean;
  status: PortalClientScheduleStatus;
  notes: string;
};

export type PortalClientFinanceStatus = "Pago" | "Pendente" | "Atrasado";

export type PortalClientFinanceRecord = ClientScopedEntity & {
  plan: string;
  description: string;
  amount: string;
  dueDate: string;
  status: PortalClientFinanceStatus;
  installment: string;
  receipt?: string;
  visibleToClient: boolean;
};

export type PortalClientHistoryRecord = ClientScopedEntity & {
  type: string;
  action: string;
  description: string;
  createdBy: string;
  date: string;
  module: string;
};

export type PayrollRecord = {
  id: number;
  user: AdminUser;
  base: string;
  allow: string;
  deduc: string;
  net: string;
  status: "Pago" | "Pendente";
};

export type LeaveRecord = {
  id: number;
  user: AdminUser;
  type: string;
  dates: string;
  days: number;
  status: "Aprovado" | "Pendente" | "Rejeitado";
};

export type CalendarEvent = {
  title: string;
  category: CalendarCategory;
  time?: string;
  location?: string;
  note?: string;
};

export type AdminNavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  children?: readonly AdminNavigationItem[];
};

export type ClientStatus =
  | "novo"
  | "briefing"
  | "design"
  | "desenvolvimento"
  | "aprovacao"
  | "concluido"
  | "inativo"
  | "lead"
  | "homologacao"
  | "publicado";

export type ClientAccountStatus = "Ativa" | "Aguardando convite" | "Inativa";

export type AdminClient = {
  id: number | string;
  name: string;
  company: string;
  email: string;
  phone: string;
  project: string;
  plan: "Essencial" | "Profissional" | "Enterprise";
  status: ClientStatus;
  progress: number;
  responsible: string;
  lastUpdate: string;
  lastAccess?: string;
  accountStatus?: ClientAccountStatus;
  linkedProject?: string;
  notes?: string;
};

export type BlogPostStatus = "Publicado" | "Rascunho" | "Agendado" | "Arquivado";

export type AdminBlogPost = {
  id: number;
  apiId?: string;
  title: string;
  slug: string;
  categoryId?: string;
  tag: string;
  author: string;
  status: BlogPostStatus;
  date: string;
  readTime: string;
  description: string;
  content: string;
  coverFileId?: string | null;
  coverUrl?: string;
  heroImageFileId?: string | null;
  heroImageUrl?: string;
  insightTitle?: string;
  insightDescription?: string;
  insightCtaLabel?: string;
  insightCtaHref?: string;
  contextTitle?: string;
  contextContent?: string;
  practicalTitle?: string;
  practicalContent?: string;
  seoTitle?: string;
  seoDescription?: string;
  commentsCount?: number;
  sharesCount?: number;
};

export type SupportTicketStatus = "Aberto" | "Respondido" | "Aguardando cliente" | "Encerrado";
export type SupportPriority = "Baixa" | "Media" | "Alta" | "Urgente";

export type SupportMessage = {
  sender: "Cliente" | "Ateliux";
  text: string;
  time: string;
};

export type SupportTicket = {
  id: number;
  code: string;
  client: string;
  subject: string;
  category: string;
  priority: SupportPriority;
  status: SupportTicketStatus;
  createdAt: string;
  lastMessage: string;
  messages: readonly SupportMessage[];
  source?: "Portal" | "Suporte" | "Contato";
  project?: string;
  responsible?: string;
  attachments?: readonly string[];
  convertedToTask?: boolean;
};

export type NewsletterSubscriberStatus = "Ativo" | "Novo" | "Descadastrado";

export type NewsletterSubscriber = {
  id: number;
  apiId?: string;
  email: string;
  name: string;
  origin: string;
  status: NewsletterSubscriberStatus;
  createdAt: string;
  interests: readonly string[];
};

export type PortalStageStatus = "Concluido" | "Em andamento" | "Aguardando cliente" | "Nao iniciado" | "Bloqueado";

export type PortalStage = {
  id: number;
  title: string;
  description: string;
  status: PortalStageStatus;
  dueDate: string;
  owner: string;
  client?: string;
  project?: string;
  sentAt?: string;
  approvalStatus?: PortalApprovalStatus;
};

export type PortalApprovalStatus = "Pendente" | "Aprovado" | "Ajustes solicitados";

export type PortalApproval = {
  id: number;
  title: string;
  project: string;
  status: PortalApprovalStatus;
  sentAt: string;
  comments: number;
  client?: string;
  previewUrl?: string;
};

export type PortalRequestStatus = "Nova" | "Em analise" | "Em execucao" | "Concluida";

export type PortalRequest = {
  id: number;
  client: string;
  title: string;
  category: string;
  status: PortalRequestStatus;
  priority: SupportPriority;
  createdAt: string;
  project?: string;
  responsible?: string;
  response?: string;
};

export type PortalFile = {
  id: number;
  name: string;
  type: string;
  origin: "Cliente" | "Ateliux";
  project: string;
  size: string;
  createdAt: string;
  linkedStage?: string;
};

export type PortalPreviewStatus = "Rascunho" | "Enviado" | "Em aprovacao" | "Aprovado" | "Arquivado";

export type PortalPreview = {
  id: number;
  title: string;
  project: string;
  client: string;
  url: string;
  status: PortalPreviewStatus;
  createdAt: string;
  sentAt?: string;
  version: string;
};

export type PortalScheduleItem = {
  id: number;
  title: string;
  project: string;
  date: string;
  type: "Reuniao" | "Entrega" | "Aprovacao" | "Publicacao";
  visibleToClient?: boolean;
};

export type PortalInvoice = {
  id: number;
  client: string;
  plan: string;
  amount: string;
  status: "Pago" | "Pendente" | "Atrasado";
  dueDate: string;
  receipt?: string;
};

export type PortalHistoryItem = {
  id: number;
  title: string;
  description: string;
  project: string;
  date: string;
  type: string;
};
