import type {
  AdminBlogPost,
  AdminClient,
  AdminInboxAttachment,
  AdminInboxConversation,
  AdminInboxPriority,
  AdminInboxStatus,
  AdminUser,
  CalendarEvent,
  InboxMessage,
  LeaveRecord,
  NewsletterSubscriber,
  PayrollRecord,
  PortalApproval,
  PortalBriefingRecord,
  PortalClientApprovalRecord,
  PortalClientFileRecord,
  PortalClientFinanceRecord,
  PortalClientHistoryRecord,
  PortalClientPreviewRecord,
  PortalClientRecord,
  PortalClientRequestRecord,
  PortalClientScheduleRecord,
  PortalClientStageRecord,
  PortalFile,
  PortalHistoryItem,
  PortalInvoice,
  PortalPreview,
  PortalProjectRecord,
  PortalRequest,
  PortalScheduleItem,
  PortalStage,
  SupportTicket,
} from "@/types/admin";

function normalizeInboxPriority(priority: SupportTicket["priority"]): AdminInboxPriority {
  const priorityMap: Record<SupportTicket["priority"], AdminInboxPriority> = {
    Baixa: "baixa",
    Media: "media",
    Alta: "alta",
    Urgente: "urgente",
  };

  return priorityMap[priority];
}

function statusFromPortalRequest(status: PortalRequest["status"]): AdminInboxStatus {
  const statusMap: Record<PortalRequest["status"], AdminInboxStatus> = {
    Nova: "novo",
    "Em analise": "aberto",
    "Em execucao": "em_atendimento",
    Concluida: "resolvido",
  };

  return statusMap[status];
}

function statusFromSupportTicket(status: SupportTicket["status"]): AdminInboxStatus {
  const statusMap: Record<SupportTicket["status"], AdminInboxStatus> = {
    Aberto: "aberto",
    Respondido: "em_atendimento",
    "Aguardando cliente": "aguardando_cliente",
    Encerrado: "resolvido",
  };

  return statusMap[status];
}

function parseMockAttachmentSize(size: string) {
  const value = Number.parseFloat(size.replace(",", "."));
  if (!Number.isFinite(value)) return 0;
  if (size.toLowerCase().includes("mb")) return Math.round(value * 1024 * 1024);
  return Math.round(value * 1024);
}

function mockInboxAttachment(id: string, name: string, size: string): AdminInboxAttachment {
  const extension = name.includes(".") ? `.${name.split(".").pop()}` : "";

  return {
    id,
    name,
    originalName: name,
    extension,
    mimeType: extension === ".pdf" ? "application/pdf" : extension === ".png" ? "image/png" : extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" : "application/octet-stream",
    size,
    sizeBytes: parseMockAttachmentSize(size),
    status: "PENDING_REVIEW",
    riskLevel: extension === ".pdf" || extension === ".png" || extension === ".jpg" || extension === ".jpeg" ? "SAFE_PREVIEW" : "DOWNLOAD_ONLY",
    downloadMode: extension === ".pdf" || extension === ".png" || extension === ".jpg" || extension === ".jpeg" ? "INLINE_ALLOWED" : "ATTACHMENT_ONLY",
    context: "CLIENT_FILE",
    uploadedByType: "CLIENT",
    origin: "CLIENT",
  };
}

export const MOCK_USERS: readonly AdminUser[] = [
  { id: 1, name: "Mia Torres", role: "Operacoes", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop" },
  { id: 2, name: "Olivia Mason", role: "UI/UX Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: 3, name: "Ethan Ray", role: "Frontend Dev", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop" },
  { id: 4, name: "Lina Armand", role: "Gerente de Projeto", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { id: 5, name: "Jacob Yuan", role: "Backend Dev", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
];

export const INBOX_MESSAGES: readonly InboxMessage[] = [
  { id: 1, sender: MOCK_USERS[1], subject: "Pedido de aprovacao", preview: "Gostaria de solicitar aprovacao do preview da home...", time: "10:30", unread: true },
  { id: 2, sender: MOCK_USERS[2], subject: "Relatorio mensal", preview: "Em anexo encontra-se o relatorio do projeto...", time: "Ontem", unread: false },
  { id: 3, sender: MOCK_USERS[3], subject: "Revisao de desempenho", preview: "Podemos agendar uma reuniao para alinhar a entrega?", time: "2 Out", unread: false },
  { id: 4, sender: MOCK_USERS[4], subject: "Atualizacao de sistema", preview: "A plataforma tera manutencao controlada hoje...", time: "1 Out", unread: false },
];

export const PAYROLL_DATA: readonly PayrollRecord[] = [
  { id: 1, user: MOCK_USERS[1], base: "R$ 3.200", allow: "R$ 300", deduc: "R$ 150", net: "R$ 3.350", status: "Pago" },
  { id: 2, user: MOCK_USERS[2], base: "R$ 4.500", allow: "R$ 400", deduc: "R$ 200", net: "R$ 4.700", status: "Pago" },
  { id: 3, user: MOCK_USERS[3], base: "R$ 5.100", allow: "R$ 500", deduc: "R$ 250", net: "R$ 5.350", status: "Pendente" },
  { id: 4, user: MOCK_USERS[4], base: "R$ 3.800", allow: "R$ 350", deduc: "R$ 180", net: "R$ 3.970", status: "Pago" },
];

export const LEAVE_ACTIVITY: readonly LeaveRecord[] = [
  { id: 1, user: MOCK_USERS[1], type: "Ferias", dates: "20 Jul - 25 Jul", days: 5, status: "Aprovado" },
  { id: 2, user: MOCK_USERS[2], type: "Atestado medico", dates: "12 Ago - 14 Ago", days: 3, status: "Aprovado" },
  { id: 3, user: MOCK_USERS[3], type: "Ausencia casual", dates: "05 Set - 06 Set", days: 2, status: "Pendente" },
  { id: 4, user: MOCK_USERS[4], type: "Ferias", dates: "10 Out - 20 Out", days: 10, status: "Rejeitado" },
];

export const CALENDAR_EVENTS_MOCK: Record<number, CalendarEvent[]> = {
  7: [{ title: "Sessao de integracao", category: "talent", time: "09:00", location: "Sala 2B", note: "Preparar kits de boas-vindas." }],
  12: [
    { title: "Entrevista de Design", category: "talent", time: "11:00", location: "Google Meet", note: "Revisar portfolio." },
    { title: "Revisao de politicas", category: "general", time: "15:00", location: "Sala A", note: "Trazer rascunhos." },
  ],
  13: [
    { title: "Introducao de novos membros", category: "talent", time: "09:00", location: "Sala 2B", note: "Preparar crachas." },
    { title: "Crescimento: lideranca", category: "development", time: "14:00", location: "Zoom", note: "Ler material previo." },
  ],
  14: [{ title: "Workshop de desenvolvimento", category: "development", time: "10:00", location: "Auditorio", note: "Confirmar projetor." }],
  20: [{ title: "Avaliacao de desempenho", category: "development", time: "13:30", location: "Sala 3", note: "Equipe criativa." }],
  22: [{ title: "Planejamento de recrutamento", category: "talent", time: "10:00", location: "Diretoria", note: "Metas do trimestre." }],
  28: [{ title: "Integracao de recrutas", category: "talent", time: "09:00", location: "Sala 2B", note: "Boas-vindas." }],
};

export const ADMIN_CLIENTS: readonly AdminClient[] = [
  {
    id: 1,
    name: "Ana Carvalho",
    company: "Marima",
    email: "ana@marima.com",
    phone: "(24) 99999-0101",
    project: "E-commerce fitness",
    plan: "Profissional",
    status: "design",
    progress: 48,
    responsible: "Lina Armand",
    lastUpdate: "Design da vitrine em revisao",
    lastAccess: "Hoje, 08:20",
    accountStatus: "Ativa",
    projectId: "PRJ-1001",
    notes: "Cliente acompanha aprovacoes pelo portal.",
  },
  {
    id: 2,
    name: "Bruno Nogueira",
    company: "Bananinha Acai",
    email: "bruno@bananinha.com",
    phone: "(24) 99999-0202",
    project: "Site de pedidos",
    plan: "Essencial",
    status: "desenvolvimento",
    progress: 64,
    responsible: "Ethan Ray",
    lastUpdate: "Montador de pedido iniciado",
    lastAccess: "Ontem",
    accountStatus: "Ativa",
    projectId: "PRJ-1002",
    notes: "Precisa receber preview do cardapio antes da publicacao.",
  },
  {
    id: 3,
    name: "Camila Rocha",
    company: "Nexa Labs",
    email: "camila@nexa.dev",
    phone: "(21) 98888-1111",
    project: "SaaS interno",
    plan: "Enterprise",
    status: "briefing",
    progress: 18,
    responsible: "Mia Torres",
    lastUpdate: "Briefing tecnico em aberto",
    lastAccess: "Aguardando primeiro acesso",
    accountStatus: "Aguardando convite",
    projectId: "PRJ-1003",
    notes: "Validar escopo tecnico antes do contrato final.",
  },
  {
    id: 4,
    name: "Daniel Costa",
    company: "Auren",
    email: "daniel@auren.com",
    phone: "(11) 97777-2222",
    project: "Landing page premium",
    plan: "Essencial",
    status: "aprovacao",
    progress: 86,
    responsible: "Olivia Mason",
    lastUpdate: "Preview enviado para aprovacao",
    lastAccess: "Hoje, 12:10",
    accountStatus: "Ativa",
    projectId: "PRJ-1004",
    notes: "Aguardando aprovacao final da hero.",
  },
  {
    id: 5,
    name: "Fernanda Souza",
    company: "Lumea",
    email: "fernanda@lumea.com",
    phone: "(31) 96666-3333",
    project: "Blog e institucional",
    plan: "Profissional",
    status: "novo",
    progress: 8,
    responsible: "Lina Armand",
    lastUpdate: "Conta criada, aguardando proposta",
    lastAccess: "Nunca acessou",
    accountStatus: "Aguardando convite",
    projectId: "PRJ-1005",
    notes: "Enviar convite apos revisao comercial.",
  },
];

export const PORTAL_CLIENTS: readonly PortalClientRecord[] = [
  {
    id: "client-marima",
    name: "Ana Carvalho",
    company: "Marima Store",
    email: "ana@marima.com",
    plan: "Profissional",
    accountStatus: "Ativa",
    responsible: "Lina Armand",
    lastActivity: "Preview da home comentado hoje",
    activeProjectId: "project-marima-ecommerce",
  },
  {
    id: "client-bananinha",
    name: "Bruno Nogueira",
    company: "Bananinha Acai",
    email: "bruno@bananinha.com",
    plan: "Essencial",
    accountStatus: "Ativa",
    responsible: "Ethan Ray",
    lastActivity: "Solicitacao de combo em execucao",
    activeProjectId: "project-bananinha-pedidos",
  },
  {
    id: "client-nexa",
    name: "Camila Rocha",
    company: "Nexa Labs",
    email: "camila@nexa.dev",
    plan: "Enterprise",
    accountStatus: "Aguardando convite",
    responsible: "Mia Torres",
    lastActivity: "Briefing tecnico aguardando envio",
    activeProjectId: "project-nexa-saas",
  },
  {
    id: "client-auren",
    name: "Daniel Costa",
    company: "Auren",
    email: "daniel@auren.com",
    plan: "Essencial",
    accountStatus: "Ativa",
    responsible: "Olivia Mason",
    lastActivity: "Aprovacao final pendente",
    activeProjectId: "project-auren-landing",
  },
  {
    id: "client-lumea",
    name: "Fernanda Souza",
    company: "Lumea",
    email: "fernanda@lumea.com",
    plan: "Profissional",
    accountStatus: "Aguardando convite",
    responsible: "Lina Armand",
    lastActivity: "Conta criada, aguardando proposta",
    activeProjectId: "project-lumea-blog",
  },
];

export const PORTAL_PROJECTS_SCOPED: readonly PortalProjectRecord[] = [
  { id: "project-marima-ecommerce", clientId: "client-marima", name: "E-commerce Marima", type: "E-commerce", scope: "Vitrine, checkout e portal de pedidos", status: "Em producao", progress: 48, responsible: "Lina Armand", deadline: "05 Jul", currentStage: "Design das telas", visibleToClient: true },
  { id: "project-bananinha-pedidos", clientId: "client-bananinha", name: "Site de pedidos", type: "Cardapio digital", scope: "Pedidos, cardapio e combos", status: "Em producao", progress: 64, responsible: "Ethan Ray", deadline: "10 Jul", currentStage: "Desenvolvimento", visibleToClient: true },
  { id: "project-nexa-saas", clientId: "client-nexa", name: "SaaS interno", type: "SaaS", scope: "Dashboard, usuarios e permissoes", status: "Rascunho interno", progress: 18, responsible: "Mia Torres", deadline: "22 Jul", currentStage: "Briefing tecnico", visibleToClient: false },
  { id: "project-auren-landing", clientId: "client-auren", name: "Landing page premium", type: "Landing page", scope: "Hero, copy e formulario", status: "Aguardando cliente", progress: 86, responsible: "Olivia Mason", deadline: "28 Jun", currentStage: "Aprovacao final", visibleToClient: true },
  { id: "project-lumea-blog", clientId: "client-lumea", name: "Blog institucional", type: "Institucional", scope: "Blog, paginas e formulario", status: "Rascunho interno", progress: 8, responsible: "Lina Armand", deadline: "18 Jul", currentStage: "Proposta", visibleToClient: false },
];

export const PORTAL_BRIEFINGS: readonly PortalBriefingRecord[] = [
  { id: "briefing-marima-1", clientId: "client-marima", projectId: "project-marima-ecommerce", title: "Briefing inicial do e-commerce", type: "Produto", description: "Objetivos, referencias e fluxo principal da loja.", status: "Respondido", createdBy: "Mia Torres", sentTo: "Ana Carvalho", createdAt: "10 Jun", sentAt: "10 Jun", visibleToClient: true, clientResponse: "Prioridade para mobile e checkout simples." },
  { id: "briefing-bananinha-1", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", title: "Cardapio e combos", type: "Operacao", description: "Mapeamento de tamanhos, adicionais e promocao.", status: "Enviado ao cliente", createdBy: "Ethan Ray", sentTo: "Bruno Nogueira", createdAt: "13 Jun", sentAt: "14 Jun", visibleToClient: true },
  { id: "briefing-nexa-1", clientId: "client-nexa", projectId: "project-nexa-saas", title: "Briefing tecnico SaaS", type: "Tecnico", description: "Usuarios, permissoes e metricas internas.", status: "Rascunho interno", createdBy: "Mia Torres", sentTo: "Camila Rocha", createdAt: "18 Jun", visibleToClient: false },
];

export const PORTAL_STAGES_SCOPED: readonly PortalClientStageRecord[] = [
  { id: "stage-marima-design", clientId: "client-marima", projectId: "project-marima-ecommerce", name: "Design da Home", responsible: "Olivia Mason", internalStatus: "Em producao", clientStatus: "Em criacao pela Ateliux", sentToClient: true, approvalPending: true, deadline: "24 Jun", lastUpdate: "Preview enviado hoje" },
  { id: "stage-marima-checkout", clientId: "client-marima", projectId: "project-marima-ecommerce", name: "Checkout", responsible: "Ethan Ray", internalStatus: "Rascunho interno", clientStatus: "Ainda nao visivel", sentToClient: false, approvalPending: false, deadline: "02 Jul", lastUpdate: "Fluxo tecnico iniciado" },
  { id: "stage-bananinha-dev", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", name: "Montador de pedidos", responsible: "Ethan Ray", internalStatus: "Em producao", clientStatus: "Em desenvolvimento", sentToClient: true, approvalPending: false, deadline: "05 Jul", lastUpdate: "Combo promocional adicionado" },
  { id: "stage-auren-approval", clientId: "client-auren", projectId: "project-auren-landing", name: "Aprovacao final", responsible: "Olivia Mason", internalStatus: "Aguardando aprovacao", clientStatus: "Aguardando resposta", sentToClient: true, approvalPending: true, deadline: "26 Jun", lastUpdate: "Cliente revisando hero" },
];

export const PORTAL_APPROVALS_SCOPED: readonly PortalClientApprovalRecord[] = [
  { id: "approval-marima-home", clientId: "client-marima", projectId: "project-marima-ecommerce", title: "Design da Home", type: "Preview", previewUrl: "https://preview.ateliux.dev/marima/home", message: "Enviar preview para: Marima Store", sentBy: "Olivia Mason", sentTo: "Ana Carvalho", status: "Aguardando cliente", sentAt: "Hoje", clientResponse: "Trocar imagem do banner" },
  { id: "approval-bananinha-checkout", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", title: "Checkout de pedidos", type: "Preview", previewUrl: "https://preview.ateliux.dev/bananinha/checkout", message: "Validar fluxo do carrinho.", sentBy: "Ethan Ray", sentTo: "Bruno Nogueira", status: "Ajustes solicitados", sentAt: "Ontem", clientResponse: "Adicionar tamanho 300ml" },
  { id: "approval-auren-copy", clientId: "client-auren", projectId: "project-auren-landing", title: "Texto institucional", type: "Copy", previewUrl: "https://preview.ateliux.dev/auren/copy", message: "Validar textos finais.", sentBy: "Lina Armand", sentTo: "Daniel Costa", status: "Aprovado", sentAt: "Ontem", clientResponse: "Aprovado" },
];

export const PORTAL_REQUESTS_SCOPED: readonly PortalClientRequestRecord[] = [
  { id: "request-marima-banner", clientId: "client-marima", projectId: "project-marima-ecommerce", origin: "Portal do Cliente", title: "Trocar fotos do banner", description: "Cliente pediu nova imagem para a colecao.", priority: "Alta", status: "Nova", sentBy: "Ana Carvalho", responsible: "Olivia Mason", createdAt: "Hoje", inboxConversationId: "portal-request-1" },
  { id: "request-bananinha-combo", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", origin: "Portal do Cliente", title: "Adicionar combo promocional", description: "Incluir combo especial no cardapio.", priority: "Media", status: "Em execucao", sentBy: "Bruno Nogueira", responsible: "Ethan Ray", createdAt: "Ontem", inboxConversationId: "portal-request-2" },
  { id: "request-auren-hero", clientId: "client-auren", projectId: "project-auren-landing", origin: "Caixa de Entrada", title: "Ajustar texto do hero", description: "Trocar chamada principal da landing.", priority: "Baixa", status: "Concluida", sentBy: "Daniel Costa", responsible: "Lina Armand", createdAt: "3 dias", inboxConversationId: "portal-request-3" },
];

export const PORTAL_FILES_SCOPED: readonly PortalClientFileRecord[] = [
  { id: "file-marima-briefing", clientId: "client-marima", projectId: "project-marima-ecommerce", name: "briefing-marima.pdf", type: "PDF", origin: "Cliente", sentBy: "Ana Carvalho", sentTo: "Ateliux", visibleToClient: true, linkedTo: "Briefing inicial", size: "1.8 MB", createdAt: "10 Jun" },
  { id: "file-marima-preview", clientId: "client-marima", projectId: "project-marima-ecommerce", name: "preview-home-v1.fig", type: "Figma", origin: "Ateliux", sentBy: "Olivia Mason", sentTo: "Ana Carvalho", visibleToClient: true, linkedTo: "Design da Home", size: "8.4 MB", createdAt: "18 Jun" },
  { id: "file-bananinha-logo", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", name: "logo-bananinha.zip", type: "ZIP", origin: "Cliente", sentBy: "Bruno Nogueira", sentTo: "Ateliux", visibleToClient: false, linkedTo: "Direcao visual", size: "4.2 MB", createdAt: "12 Jun" },
];

export const PORTAL_PREVIEWS_SCOPED: readonly PortalClientPreviewRecord[] = [
  { id: "preview-marima-home", clientId: "client-marima", projectId: "project-marima-ecommerce", title: "Home Marima v1", url: "https://preview.ateliux.dev/marima/home", status: "Em aprovacao", createdAt: "18 Jun", sentAt: "Hoje", version: "v1" },
  { id: "preview-bananinha-checkout", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", title: "Checkout Bananinha", url: "https://preview.ateliux.dev/bananinha/checkout", status: "Enviado", createdAt: "17 Jun", sentAt: "Ontem", version: "v2" },
  { id: "preview-auren-hero", clientId: "client-auren", projectId: "project-auren-landing", title: "Hero Auren", url: "https://preview.ateliux.dev/auren/hero", status: "Aprovado", createdAt: "14 Jun", sentAt: "14 Jun", version: "v1" },
];

export const PORTAL_SCHEDULE_SCOPED: readonly PortalClientScheduleRecord[] = [
  { id: "schedule-marima-briefing", clientId: "client-marima", projectId: "project-marima-ecommerce", title: "Reuniao de briefing", type: "Reuniao", date: "12 Jun", time: "10:00", responsible: "Mia Torres", visibleToClient: true, status: "Concluido", notes: "Escopo inicial validado." },
  { id: "schedule-marima-home", clientId: "client-marima", projectId: "project-marima-ecommerce", title: "Entrega da Home", type: "Entrega", date: "24 Jun", time: "15:00", responsible: "Olivia Mason", visibleToClient: true, status: "Visivel no portal", notes: "Aguardando aprovacao do preview." },
  { id: "schedule-auren-approval", clientId: "client-auren", projectId: "project-auren-landing", title: "Prazo de aprovacao", type: "Aprovacao", date: "26 Jun", time: "18:00", responsible: "Lina Armand", visibleToClient: false, status: "Interno", notes: "Enviar lembrete se nao houver resposta." },
];

export const PORTAL_FINANCE_SCOPED: readonly PortalClientFinanceRecord[] = [
  { id: "finance-marima-1", clientId: "client-marima", projectId: "project-marima-ecommerce", plan: "Profissional", description: "Parcela 1 do e-commerce", amount: "R$ 3.900", dueDate: "10 Jun", status: "Pago", installment: "1/3", receipt: "recibo-marima-001.pdf", visibleToClient: true },
  { id: "finance-bananinha-1", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", plan: "Essencial", description: "Parcela inicial do site de pedidos", amount: "R$ 1.490", dueDate: "25 Jun", status: "Pendente", installment: "1/2", visibleToClient: true },
  { id: "finance-nexa-setup", clientId: "client-nexa", projectId: "project-nexa-saas", plan: "Enterprise", description: "Setup SaaS interno", amount: "Sob consulta", dueDate: "18 Jun", status: "Atrasado", installment: "Setup", visibleToClient: false },
];

export const PORTAL_HISTORY_SCOPED: readonly PortalClientHistoryRecord[] = [
  { id: "history-marima-briefing", clientId: "client-marima", projectId: "project-marima-ecommerce", type: "Briefing", action: "Enviado ao cliente", description: "Briefing inicial enviado para Marima Store.", createdBy: "Mia Torres", date: "10 Jun", module: "Briefings" },
  { id: "history-marima-preview", clientId: "client-marima", projectId: "project-marima-ecommerce", type: "Preview", action: "Enviado para aprovacao", description: "Preview da Home enviado para aprovacao.", createdBy: "Olivia Mason", date: "Hoje", module: "Previews" },
  { id: "history-bananinha-stage", clientId: "client-bananinha", projectId: "project-bananinha-pedidos", type: "Etapa", action: "Em producao", description: "Etapa Montador de pedidos marcada como em producao.", createdBy: "Ethan Ray", date: "Ontem", module: "Etapas" },
  { id: "history-auren-finance", clientId: "client-auren", projectId: "project-auren-landing", type: "Financeiro", action: "Recibo emitido", description: "Recibo da parcela 1 visualizado pelo cliente.", createdBy: "Mia Torres", date: "2 dias", module: "Financeiro" },
];

export const ADMIN_BLOG_POSTS: readonly AdminBlogPost[] = [
  {
    id: 1,
    title: "Como transformar uma ideia em produto digital",
    slug: "como-transformar-ideia-em-produto-digital",
    tag: "Produto",
    author: "Equipe Ateliux",
    status: "Publicado",
    date: "18 Jun 2026",
    readTime: "6 min",
    description: "Um guia sobre estrategia, design e tecnologia para estruturar produtos digitais reais.",
    content: "A criacao de um produto digital comeca pela clareza do problema, passa por uma direcao visual consistente e evolui para uma arquitetura sustentavel.",
  },
  {
    id: 2,
    title: "Por que o design system acelera software",
    slug: "por-que-design-system-acelera-software",
    tag: "Design",
    author: "Ateliux Studio",
    status: "Rascunho",
    date: "20 Jun 2026",
    readTime: "5 min",
    description: "Como componentes, padroes e paleta reduzem retrabalho durante a construcao.",
    content: "Um design system bem planejado organiza decisoes visuais e torna o desenvolvimento mais previsivel.",
  },
  {
    id: 3,
    title: "E-commerce sob medida: quando vale criar o seu",
    slug: "ecommerce-sob-medida-quando-vale-criar",
    tag: "E-commerce",
    author: "Equipe Ateliux",
    status: "Agendado",
    date: "28 Jun 2026",
    readTime: "7 min",
    description: "Criterios para entender quando uma loja propria supera solucoes genericas.",
    content: "Empresas com operacao propria, diferenciais comerciais e necessidade de controle podem ganhar muito com uma plataforma sob medida.",
  },
  {
    id: 4,
    title: "Checklist para publicar uma landing page",
    slug: "checklist-para-publicar-landing-page",
    tag: "Operacao",
    author: "Equipe Ateliux",
    status: "Arquivado",
    date: "04 Jun 2026",
    readTime: "4 min",
    description: "Itens tecnicos e visuais que precisam estar prontos antes de abrir campanha.",
    content: "A publicacao precisa validar copy, eventos, performance, formularios, responsividade e acompanhamento comercial.",
  },
];

export const SUPPORT_TICKETS: readonly SupportTicket[] = [
  {
    id: 1,
    code: "SUP-1042",
    client: "Marima",
    subject: "Alteracao no banner principal",
    category: "Design",
    priority: "Alta",
    status: "Aberto",
    createdAt: "Hoje, 09:40",
    lastMessage: "Precisamos trocar a imagem da colecao nova.",
    source: "Portal",
    project: "E-commerce fitness",
    responsible: "Olivia Mason",
    attachments: ["banner-nova-colecao.jpg"],
    messages: [{ sender: "Cliente", text: "Precisamos trocar a imagem da colecao nova.", time: "09:40" }],
  },
  {
    id: 2,
    code: "SUP-1038",
    client: "Bananinha Acai",
    subject: "Adicionar novo tamanho no cardapio",
    category: "Funcionalidade",
    priority: "Media",
    status: "Respondido",
    createdAt: "Ontem",
    lastMessage: "Ja deixamos em analise para a proxima revisao.",
    source: "Suporte",
    project: "Site de pedidos",
    responsible: "Ethan Ray",
    attachments: [],
    messages: [
      { sender: "Cliente", text: "Quero adicionar 300ml no cardapio.", time: "Ontem" },
      { sender: "Ateliux", text: "Ja deixamos em analise para a proxima revisao.", time: "Ontem" },
    ],
  },
  {
    id: 3,
    code: "SUP-1029",
    client: "Auren",
    subject: "Duvida sobre publicacao",
    category: "Deploy",
    priority: "Baixa",
    status: "Aguardando cliente",
    createdAt: "2 dias atras",
    lastMessage: "Aguardamos a confirmacao do dominio.",
    source: "Contato",
    project: "Landing page premium",
    responsible: "Jacob Yuan",
    attachments: ["checklist-dominio.pdf"],
    messages: [{ sender: "Ateliux", text: "Aguardamos a confirmacao do dominio.", time: "2 dias" }],
  },
];

export const NEWSLETTER_SUBSCRIBERS: readonly NewsletterSubscriber[] = [
  { id: 1, email: "contato@marima.com", name: "Marima", origin: "Blog", status: "Ativo", createdAt: "Hoje", interests: ["E-commerce", "Design"] },
  { id: 2, email: "cliente@startup.dev", name: "Startup Lead", origin: "Artigo SaaS", status: "Novo", createdAt: "Ontem", interests: ["SaaS", "Arquitetura"] },
  { id: 3, email: "marketing@empresa.com", name: "Equipe Marketing", origin: "Newsletter do blog", status: "Ativo", createdAt: "12 Jun", interests: ["Landing pages", "Automacao"] },
  { id: 4, email: "old@email.com", name: "Contato antigo", origin: "Blog", status: "Descadastrado", createdAt: "02 Jun", interests: ["Blog"] },
];

export const PORTAL_STAGES: readonly PortalStage[] = [
  { id: 1, title: "Briefing recebido", description: "Coleta inicial dos objetivos, referencias e escopo.", status: "Concluido", dueDate: "10 Jun", owner: "Mia Torres", client: "Marima", project: "E-commerce fitness", sentAt: "10 Jun", approvalStatus: "Aprovado" },
  { id: 2, title: "Direcao visual", description: "Definicao da linguagem visual do projeto.", status: "Concluido", dueDate: "14 Jun", owner: "Olivia Mason", client: "Marima", project: "E-commerce fitness", sentAt: "14 Jun", approvalStatus: "Aprovado" },
  { id: 3, title: "Design das telas", description: "Criacao das principais telas para aprovacao.", status: "Em andamento", dueDate: "24 Jun", owner: "Olivia Mason", client: "Marima", project: "E-commerce fitness", sentAt: "Hoje", approvalStatus: "Pendente" },
  { id: 4, title: "Aprovacao do cliente", description: "Cliente revisa a primeira versao do design.", status: "Aguardando cliente", dueDate: "26 Jun", owner: "Cliente", client: "Auren", project: "Landing page premium", sentAt: "Ontem", approvalStatus: "Pendente" },
  { id: 5, title: "Desenvolvimento", description: "Implementacao frontend e integracoes.", status: "Nao iniciado", dueDate: "02 Jul", owner: "Ethan Ray", client: "Bananinha Acai", project: "Site de pedidos", sentAt: "-", approvalStatus: "Pendente" },
];

export const PORTAL_APPROVALS: readonly PortalApproval[] = [
  { id: 1, title: "Design da Home", project: "E-commerce fitness", client: "Marima", status: "Pendente", sentAt: "Hoje", comments: 2, previewUrl: "https://preview.ateliux.dev/marima/home" },
  { id: 2, title: "Texto institucional", project: "Landing page premium", client: "Auren", status: "Aprovado", sentAt: "Ontem", comments: 1, previewUrl: "https://preview.ateliux.dev/auren/copy" },
  { id: 3, title: "Preview de checkout", project: "Site de pedidos", client: "Bananinha Acai", status: "Ajustes solicitados", sentAt: "2 dias", comments: 4, previewUrl: "https://preview.ateliux.dev/bananinha/checkout" },
];

export const PORTAL_REQUESTS: readonly PortalRequest[] = [
  { id: 1, client: "Marima", title: "Trocar fotos do banner", category: "Design", status: "Nova", priority: "Alta", createdAt: "Hoje", project: "E-commerce fitness", responsible: "Olivia Mason", response: "" },
  { id: 2, client: "Bananinha Acai", title: "Adicionar combo promocional", category: "Funcionalidade", status: "Em execucao", priority: "Media", createdAt: "Ontem", project: "Site de pedidos", responsible: "Ethan Ray", response: "Entrou no proximo ciclo." },
  { id: 3, client: "Auren", title: "Ajustar texto do hero", category: "Texto", status: "Concluida", priority: "Baixa", createdAt: "3 dias", project: "Landing page premium", responsible: "Lina Armand", response: "Texto atualizado no preview." },
];

export const PORTAL_FILES: readonly PortalFile[] = [
  { id: 1, name: "briefing-marima.pdf", type: "PDF", origin: "Cliente", project: "E-commerce fitness", size: "1.8 MB", createdAt: "10 Jun", linkedStage: "Briefing recebido" },
  { id: 2, name: "preview-home-v1.fig", type: "Figma", origin: "Ateliux", project: "E-commerce fitness", size: "8.4 MB", createdAt: "18 Jun", linkedStage: "Design das telas" },
  { id: 3, name: "logo-bananinha.zip", type: "ZIP", origin: "Cliente", project: "Site de pedidos", size: "4.2 MB", createdAt: "12 Jun", linkedStage: "Direcao visual" },
];

export const PORTAL_PREVIEWS: readonly PortalPreview[] = [
  { id: 1, title: "Home Marima v1", project: "E-commerce fitness", client: "Marima", url: "https://preview.ateliux.dev/marima/home", status: "Em aprovacao", createdAt: "18 Jun", sentAt: "Hoje", version: "v1" },
  { id: 2, title: "Checkout Bananinha", project: "Site de pedidos", client: "Bananinha Acai", url: "https://preview.ateliux.dev/bananinha/checkout", status: "Enviado", createdAt: "17 Jun", sentAt: "Ontem", version: "v2" },
  { id: 3, title: "Hero Auren", project: "Landing page premium", client: "Auren", url: "https://preview.ateliux.dev/auren/hero", status: "Aprovado", createdAt: "14 Jun", sentAt: "14 Jun", version: "v1" },
];

export const PORTAL_SCHEDULE: readonly PortalScheduleItem[] = [
  { id: 1, title: "Reuniao de briefing", project: "E-commerce fitness", date: "12 Jun", type: "Reuniao", visibleToClient: true },
  { id: 2, title: "Entrega da Home", project: "E-commerce fitness", date: "24 Jun", type: "Entrega", visibleToClient: true },
  { id: 3, title: "Prazo de aprovacao", project: "Landing page premium", date: "26 Jun", type: "Aprovacao", visibleToClient: false },
  { id: 4, title: "Publicacao prevista", project: "Site de pedidos", date: "05 Jul", type: "Publicacao", visibleToClient: true },
];

export const PORTAL_INVOICES: readonly PortalInvoice[] = [
  { id: 1, client: "Marima", plan: "Profissional", amount: "R$ 3.900", status: "Pago", dueDate: "10 Jun", receipt: "recibo-marima-001.pdf" },
  { id: 2, client: "Bananinha Acai", plan: "Essencial", amount: "R$ 1.490", status: "Pendente", dueDate: "25 Jun" },
  { id: 3, client: "Nexa Labs", plan: "Enterprise", amount: "Sob consulta", status: "Atrasado", dueDate: "18 Jun" },
];

export const PORTAL_HISTORY: readonly PortalHistoryItem[] = [
  { id: 1, title: "Briefing aprovado", description: "Cliente confirmou escopo inicial.", project: "E-commerce fitness", date: "10 Jun", type: "Briefing" },
  { id: 2, title: "Design enviado", description: "Primeira versao da home enviada para aprovacao.", project: "E-commerce fitness", date: "20 Jun", type: "Design" },
  { id: 3, title: "Solicitacao recebida", description: "Cliente pediu troca de imagem no banner.", project: "E-commerce fitness", date: "Hoje", type: "Solicitacao" },
];

const clientAvatarByCompany: Record<string, string | undefined> = {
  Marima: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  Auren: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
};

function findClientByCompany(company: string) {
  return ADMIN_CLIENTS.find((client) => client.company === company);
}

function clientIdFromCompany(company: string) {
  const clientIdMap: Record<string, string> = {
    Marima: "client-marima",
    "Bananinha Acai": "client-bananinha",
    "Nexa Labs": "client-nexa",
    Auren: "client-auren",
    Lumea: "client-lumea",
  };

  return clientIdMap[company] ?? `client-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export const ADMIN_INBOX_CONVERSATIONS: readonly AdminInboxConversation[] = [
  {
    id: "cli-aprovacao-marima-home",
    clientId: "client-marima",
    projectId: "project-marima-ecommerce",
    channel: "clientes",
    clientName: "Ana Carvalho",
    clientCompany: "Marima",
    clientEmail: "ana@marima.com",
    clientAvatarUrl: clientAvatarByCompany.Marima,
    projectName: "E-commerce fitness",
    subject: "Comentarios no preview da home",
    preview: "Gostei da vitrine, mas queria testar outra imagem no banner.",
    status: "novo",
    priority: "alta",
    unread: true,
    assignedTo: "Olivia Mason",
    source: "aprovacao",
    createdAt: "Hoje, 10:30",
    updatedAt: "10:30",
    messages: [
      {
        id: "msg-cli-home-1",
        senderId: "cliente-marima",
        body: "Gostei da vitrine, mas queria testar outra imagem no banner principal antes de aprovar o preview.",
        createdAt: "10:30",
        from: "cliente",
        attachments: [mockInboxAttachment("att-marima-1", "referencia-banner.jpg", "1.1 MB")],
      },
      {
        id: "msg-cli-home-2",
        senderId: "sistema",
        body: "Origem: comentario em aprovacao do Portal do Cliente.",
        createdAt: "10:31",
        from: "sistema",
      },
    ],
  },
  {
    id: "cli-financeiro-auren",
    clientId: "client-auren",
    projectId: "project-auren-landing",
    channel: "clientes",
    clientName: "Daniel Costa",
    clientCompany: "Auren",
    clientEmail: "daniel@auren.com",
    clientAvatarUrl: clientAvatarByCompany.Auren,
    projectName: "Landing page premium",
    subject: "Duvida sobre a proxima parcela",
    preview: "Conseguem confirmar se o recibo da parcela ja foi emitido?",
    status: "aberto",
    priority: "media",
    unread: false,
    assignedTo: "Mia Torres",
    source: "financeiro",
    createdAt: "Ontem",
    updatedAt: "Ontem",
    messages: [
      {
        id: "msg-cli-fin-1",
        senderId: "cliente-auren",
        body: "Conseguem confirmar se o recibo da parcela ja foi emitido? Preciso enviar para o financeiro ainda hoje.",
        createdAt: "Ontem",
        from: "cliente",
      },
    ],
  },
  {
    id: "sup-acesso-portal",
    clientId: "client-nexa",
    projectId: "project-nexa-saas",
    channel: "suporte",
    clientName: "Lucas Martins",
    clientCompany: "Nexa Labs",
    clientEmail: "lucas@nexa.dev",
    projectName: "SaaS interno",
    subject: "Nao consigo acessar o portal",
    preview: "A senha foi redefinida, mas continuo sem conseguir entrar.",
    status: "aberto",
    priority: "urgente",
    unread: true,
    assignedTo: "Jacob Yuan",
    source: "suporte",
    createdAt: "Hoje, 09:12",
    updatedAt: "09:12",
    messages: [
      {
        id: "msg-sup-acesso-1",
        senderId: "cliente-nexa",
        body: "A senha foi redefinida, mas continuo sem conseguir entrar no portal. A tela volta para login.",
        createdAt: "09:12",
        from: "cliente",
      },
      {
        id: "msg-sup-acesso-2",
        senderId: "sistema",
        body: "Chamado aberto pela area de suporte.",
        createdAt: "09:13",
        from: "sistema",
      },
    ],
  },
  {
    id: "sup-preview-erro",
    clientId: "client-marima",
    projectId: "project-marima-ecommerce",
    channel: "suporte",
    clientName: "Marima Store",
    clientCompany: "Marima",
    clientEmail: "contato@marima.com",
    projectName: "E-commerce fitness",
    subject: "Erro ao visualizar preview",
    preview: "O link do preview abre, mas a pagina fica carregando.",
    status: "em_atendimento",
    priority: "alta",
    unread: false,
    assignedTo: "Ethan Ray",
    source: "suporte",
    createdAt: "Ontem",
    updatedAt: "Ontem",
    messages: [
      {
        id: "msg-sup-preview-1",
        senderId: "cliente-marima",
        body: "O link do preview abre, mas a pagina fica carregando. Testei em dois navegadores.",
        createdAt: "Ontem",
        from: "cliente",
        attachments: [mockInboxAttachment("att-preview-error", "erro-preview.png", "680 KB")],
      },
      {
        id: "msg-sup-preview-2",
        senderId: "ateliux",
        body: "Estamos verificando o deploy do preview e retorno ainda hoje.",
        createdAt: "Ontem",
        from: "ateliux",
      },
    ],
  },
  ...PORTAL_REQUESTS.map((request) => {
    const client = findClientByCompany(request.client);

    return {
      id: `portal-request-${request.id}`,
      clientId: clientIdFromCompany(request.client),
      projectId: PORTAL_PROJECTS_SCOPED.find((project) => project.clientId === clientIdFromCompany(request.client))?.id,
      channel: "clientes" as const,
      clientName: client?.name ?? request.client,
      clientCompany: request.client,
      clientEmail: client?.email ?? `cliente-${request.id}@ateliux.local`,
      clientAvatarUrl: clientAvatarByCompany[request.client],
      projectName: request.project,
      subject: request.title,
      preview: request.response || `Solicitacao de ${request.category.toLowerCase()} recebida pelo portal.`,
      status: statusFromPortalRequest(request.status),
      priority: normalizeInboxPriority(request.priority),
      unread: request.status === "Nova",
      assignedTo: request.responsible,
      source: "solicitacao" as const,
      createdAt: request.createdAt,
      updatedAt: request.createdAt,
      messages: [
        {
          id: `portal-request-${request.id}-cliente`,
          senderId: `cliente-${request.id}`,
          body: request.title,
          createdAt: request.createdAt,
          from: "cliente" as const,
        },
        ...(request.response
          ? [
              {
                id: `portal-request-${request.id}-ateliux`,
                senderId: "ateliux",
                body: request.response,
                createdAt: "Registrado",
                from: "ateliux" as const,
              },
            ]
          : []),
      ],
    };
  }),
  ...SUPPORT_TICKETS.map((ticket) => {
    const client = findClientByCompany(ticket.client);
    const isClientPortal = ticket.source === "Portal";

    return {
      id: `support-ticket-${ticket.id}`,
      clientId: clientIdFromCompany(ticket.client),
      projectId: PORTAL_PROJECTS_SCOPED.find((project) => project.clientId === clientIdFromCompany(ticket.client))?.id,
      channel: isClientPortal ? ("clientes" as const) : ("suporte" as const),
      clientName: client?.name ?? ticket.client,
      clientCompany: ticket.client,
      clientEmail: client?.email ?? `suporte-${ticket.id}@ateliux.local`,
      clientAvatarUrl: clientAvatarByCompany[ticket.client],
      projectName: ticket.project,
      subject: ticket.subject,
      preview: ticket.lastMessage,
      status: statusFromSupportTicket(ticket.status),
      priority: normalizeInboxPriority(ticket.priority),
      unread: ticket.status === "Aberto",
      assignedTo: ticket.responsible,
      source: isClientPortal ? ("portal_cliente" as const) : ("suporte" as const),
      createdAt: ticket.createdAt,
      updatedAt: ticket.createdAt,
      messages: ticket.messages.map((message, index) => ({
        id: `support-ticket-${ticket.id}-${index}`,
        senderId: message.sender === "Ateliux" ? "ateliux" : `cliente-ticket-${ticket.id}`,
        body: message.text,
        createdAt: message.time,
        from: message.sender === "Ateliux" ? ("ateliux" as const) : ("cliente" as const),
        attachments: index === 0 ? ticket.attachments?.map((attachment, attachmentIndex) => mockInboxAttachment(`support-ticket-${ticket.id}-att-${attachmentIndex}`, attachment, "1.0 MB")) : undefined,
      })),
    };
  }),
];
