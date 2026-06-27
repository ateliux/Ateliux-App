import type {
  ClientApproval,
  ClientFile,
  ClientHistoryItem,
  ClientInvoice,
  ClientPortalUser,
  ClientPreview,
  ClientProject,
  ClientProjectStage,
  ClientRequest,
  ClientScheduleEvent,
  ClientSupportTicket,
  ClientTeamMember,
} from "@/types/client-portal";

const isoWithOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const displayWithOffset = (days: number) => new Intl.DateTimeFormat("pt-BR").format(new Date(`${isoWithOffset(days)}T12:00:00`));

export const clientPortalUser: ClientPortalUser = {
  id: 1,
  name: "Marina Costa",
  company: "Aurora Consultoria",
  email: "marina@auroraconsultoria.com.br",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  currentProjectId: 1,
};

export const clientTeam: ClientTeamMember[] = [
  { id: 1, name: "Louis Evans", role: "Gerente do projeto", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop", responsibilities: ["Planejamento", "Prazos", "Comunicacao com o cliente"], status: "available", contactLabel: "Contato principal" },
  { id: 2, name: "Bessie Stone", role: "Product Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", responsibilities: ["Direcao visual", "Prototipos", "Design das telas"], status: "busy", contactLabel: "Design" },
  { id: 3, name: "Will Wade", role: "Desenvolvedor frontend", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", responsibilities: ["Interface", "Responsividade", "Performance"], status: "available", contactLabel: "Desenvolvimento" },
  { id: 4, name: "Charlie Price", role: "Desenvolvedora backend", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop", responsibilities: ["APIs", "Integracoes", "Dados"], status: "busy", contactLabel: "Backend" },
  { id: 5, name: "Emily Tyler", role: "Suporte ao cliente", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop", responsibilities: ["Tickets", "Duvidas", "Pos-entrega"], status: "available", contactLabel: "Suporte" },
];

export const clientProjects: ClientProject[] = [
  {
    id: 1,
    name: "Site Institucional Aurora",
    type: "Site institucional",
    plan: "Profissional",
    status: "in_progress",
    progress: 62,
    currentStage: "Design das telas",
    nextStage: "Aprovacao da home",
    estimatedDeadline: displayWithOffset(42),
    managerId: 1,
    briefing: "Reposicionar a Aurora Consultoria com uma presenca digital clara, premium e preparada para captacao de leads.",
    objective: "Apresentar servicos, fortalecer autoridade e aumentar pedidos de diagnostico comercial.",
    audience: "Empresas de medio porte que buscam consultoria estrategica e operacional.",
    pages: ["Home", "Sobre", "Servicos", "Cases", "Blog", "Contato", "Politicas legais"],
    features: [
      { id: 1, title: "Formulario de contato", description: "Formulario com qualificacao inicial do lead.", status: "in_progress" },
      { id: 2, title: "Blog institucional", description: "Estrutura editorial com artigos e categorias.", status: "not_started" },
      { id: 3, title: "Cases de sucesso", description: "Apresentacao de resultados e depoimentos.", status: "completed" },
    ],
    integrations: [
      { id: 1, title: "Google Analytics", description: "Metricas de acesso e conversao.", status: "not_started" },
      { id: 2, title: "WhatsApp", description: "Contato rapido pelo canal comercial.", status: "completed" },
    ],
    deliverables: [
      { id: 1, title: "Design responsivo", description: "Layouts desktop, tablet e mobile.", status: "in_progress" },
      { id: 2, title: "Codigo-fonte", description: "Frontend publicado e documentado.", status: "not_started" },
      { id: 3, title: "Guia de uso", description: "Orientacoes para operacao do site.", status: "not_started" },
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "CMS headless"],
    usefulLinks: [{ label: "Prototipo do projeto", url: "https://example.com/prototipo-aurora" }, { label: "Ambiente de homologacao", url: "https://example.com/aurora-staging" }],
    notes: ["Conteudos finais devem ser enviados antes do desenvolvimento.", "O dominio sera apontado apos a aprovacao final."],
  },
  {
    id: 2,
    name: "Landing Page Programa Lidera",
    type: "Landing page",
    plan: "Essencial",
    status: "waiting_client",
    progress: 84,
    currentStage: "Aprovacao do cliente",
    nextStage: "Publicacao",
    estimatedDeadline: displayWithOffset(12),
    managerId: 1,
    briefing: "Pagina de conversao para o novo programa de lideranca.",
    objective: "Captar inscricoes para a primeira turma.",
    audience: "Gestores e coordenadores em transicao para cargos de lideranca.",
    pages: ["Landing page", "Obrigado"],
    features: [{ id: 10, title: "Captura de leads", description: "Formulario integrado ao fluxo comercial.", status: "completed" }],
    integrations: [{ id: 10, title: "E-mail marketing", description: "Envio para automacao comercial.", status: "waiting_client" }],
    deliverables: [{ id: 10, title: "Landing page publicada", description: "Pagina responsiva em dominio final.", status: "in_progress" }],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    usefulLinks: [{ label: "Homologacao", url: "https://example.com/lidera-staging" }],
    notes: ["Aguardando aprovacao do texto final."],
  },
];

export const clientStages: ClientProjectStage[] = [
  { id: 1, order: 1, title: "Briefing recebido", description: "Levantamento inicial de negocio, publico e objetivos.", status: "completed", expectedDate: displayWithOffset(-55), completedDate: displayWithOffset(-57), responsible: "Louis Evans", notes: "Briefing validado com o cliente.", requiresApproval: false },
  { id: 2, order: 2, title: "Planejamento do projeto", description: "Definicao de escopo, arquitetura e cronograma.", status: "completed", expectedDate: displayWithOffset(-45), completedDate: displayWithOffset(-46), responsible: "Louis Evans", notes: "Escopo aprovado sem ressalvas.", requiresApproval: false },
  { id: 3, order: 3, title: "Direcao visual", description: "Pesquisa, referencias e definicao da linguagem visual.", status: "completed", expectedDate: displayWithOffset(-30), completedDate: displayWithOffset(-31), responsible: "Bessie Stone", notes: "Moodboard aprovado.", requiresApproval: true },
  { id: 4, order: 4, title: "Design das telas", description: "Criacao das interfaces e prototipo navegavel.", status: "in_progress", expectedDate: displayWithOffset(7), responsible: "Bessie Stone", notes: "Home em revisao interna.", requiresApproval: false },
  { id: 5, order: 5, title: "Aprovacao do cliente", description: "Validacao das telas antes do desenvolvimento.", status: "waiting_client", expectedDate: displayWithOffset(12), responsible: "Marina Costa", notes: "A home sera enviada primeiro.", requiresApproval: true },
  { id: 6, order: 6, title: "Desenvolvimento frontend", description: "Implementacao responsiva das telas aprovadas.", status: "not_started", expectedDate: displayWithOffset(24), responsible: "Will Wade", notes: "Inicio apos aprovacao visual.", requiresApproval: false },
  { id: 7, order: 7, title: "Backend e integracoes", description: "Formularios, CMS e integracoes previstas.", status: "not_started", expectedDate: displayWithOffset(31), responsible: "Charlie Price", notes: "Dependente dos acessos do cliente.", requiresApproval: false },
  { id: 8, order: 8, title: "Revisao final", description: "Testes, conteudo e ajustes finais.", status: "not_started", expectedDate: displayWithOffset(37), responsible: "Equipe Ateliux", notes: "Checklist completo de qualidade.", requiresApproval: true },
  { id: 9, order: 9, title: "Publicacao", description: "Deploy no dominio oficial e verificacoes.", status: "not_started", expectedDate: displayWithOffset(42), responsible: "Will Wade", notes: "Janela de publicacao a confirmar.", requiresApproval: false },
  { id: 10, order: 10, title: "Pos-entrega", description: "Acompanhamento inicial e suporte.", status: "not_started", expectedDate: displayWithOffset(49), responsible: "Emily Tyler", notes: "Periodo de estabilizacao.", requiresApproval: false },
];

export const clientApprovals: ClientApproval[] = [
  { id: 1, title: "Direcao visual", description: "Cores, tipografia e referencias visuais.", status: "approved", sentAt: displayWithOffset(-32), responsible: "Bessie Stone", previewLabel: "Ver moodboard", comment: "Aprovado sem ajustes." },
  { id: 2, title: "Design da home", description: "Primeira versao completa da pagina inicial.", status: "pending", sentAt: displayWithOffset(-1), responsible: "Bessie Stone", previewLabel: "Abrir prototipo" },
  { id: 3, title: "Textos principais", description: "Titulos e textos das secoes comerciais.", status: "changes_requested", sentAt: displayWithOffset(-4), responsible: "Louis Evans", previewLabel: "Ler textos", comment: "Reforcar a proposta de valor na primeira dobra." },
  { id: 4, title: "Pagina de contato", description: "Fluxo e campos do formulario comercial.", status: "pending", sentAt: displayWithOffset(2), responsible: "Bessie Stone", previewLabel: "Ver layout" },
];

export const clientRequests: ClientRequest[] = [
  { id: 1, title: "Trocar imagem da secao de servicos", category: "image", description: "Usar a nova foto da equipe enviada no briefing.", priority: "medium", status: "in_review", createdAt: displayWithOffset(-3), response: "A imagem esta em tratamento e sera aplicada na proxima versao." },
  { id: 2, title: "Adicionar servico de diagnostico", category: "text", description: "Incluir o novo servico na pagina de solucoes.", priority: "high", status: "answered", createdAt: displayWithOffset(-8), response: "Incluido no escopo atual sem custo adicional." },
];

export const clientFiles: ClientFile[] = [
  { id: 1, name: "briefing-projeto.pdf", type: "PDF", origin: "Cliente", date: displayWithOffset(-57), size: "1,8 MB", status: "available" },
  { id: 2, name: "logo-aurora.svg", type: "SVG", origin: "Cliente", date: displayWithOffset(-52), size: "86 KB", status: "available" },
  { id: 3, name: "proposta-comercial.pdf", type: "PDF", origin: "Ateliux", date: displayWithOffset(-60), size: "2,4 MB", status: "available" },
  { id: 4, name: "layout-home-v1.pdf", type: "PDF", origin: "Ateliux", date: displayWithOffset(-1), size: "6,2 MB", status: "available" },
  { id: 5, name: "imagens-institucionais.zip", type: "ZIP", origin: "Cliente", date: displayWithOffset(-20), size: "24 MB", status: "available" },
];

export const clientPreviews: ClientPreview[] = [
  { id: 1, page: "Home", status: "available", updatedAt: displayWithOffset(-1), url: "https://example.com/aurora/home", comments: ["Revisar chamada da primeira dobra."] },
  { id: 2, page: "Sobre", status: "in_review", updatedAt: displayWithOffset(-2), url: "https://example.com/aurora/sobre", comments: [] },
  { id: 3, page: "Servicos", status: "in_review", updatedAt: displayWithOffset(-2), url: "https://example.com/aurora/servicos", comments: ["Adicionar o diagnostico empresarial."] },
  { id: 4, page: "Contato", status: "unavailable", updatedAt: displayWithOffset(-5), comments: [] },
];

export const clientScheduleEvents: ClientScheduleEvent[] = [
  { id: 1, title: "Reuniao de briefing", date: isoWithOffset(-55), time: "10:00", type: "meeting", description: "Alinhamento inicial do projeto.", responsible: "Louis Evans" },
  { id: 2, title: "Entrega da primeira versao", date: isoWithOffset(7), time: "16:00", type: "delivery", description: "Envio das telas principais para revisao.", responsible: "Bessie Stone" },
  { id: 3, title: "Prazo para aprovacao da home", date: isoWithOffset(12), time: "18:00", type: "approval", description: "Data limite para retorno do cliente.", responsible: "Marina Costa" },
  { id: 4, title: "Inicio do desenvolvimento", date: isoWithOffset(16), time: "09:00", type: "development", description: "Inicio da implementacao frontend.", responsible: "Will Wade" },
  { id: 5, title: "Publicacao prevista", date: isoWithOffset(42), time: "14:00", type: "publication", description: "Deploy no dominio oficial.", responsible: "Equipe Ateliux" },
];

export const clientSupportTickets: ClientSupportTicket[] = [
  { id: 1, subject: "Duvida sobre envio de conteudos", category: "Conteudo", priority: "medium", status: "answered", updatedAt: displayWithOffset(-1), messages: [{ id: 1, author: "Cliente", message: "Posso enviar os textos em um unico documento?", sentAt: `${displayWithOffset(-2)} 10:20` }, { id: 2, author: "Ateliux", message: "Sim. Um documento organizado por pagina funciona perfeitamente.", sentAt: `${displayWithOffset(-1)} 09:10` }] },
  { id: 2, subject: "Acesso ao dominio", category: "Tecnico", priority: "high", status: "waiting_client", updatedAt: displayWithOffset(-3), messages: [{ id: 3, author: "Ateliux", message: "Precisamos do acesso ao provedor do dominio antes da publicacao.", sentAt: `${displayWithOffset(-3)} 15:00` }] },
];

export const clientInvoices: ClientInvoice[] = [
  { id: 1, label: "Entrada - Parcela 1/3", dueDate: displayWithOffset(-60), amount: 3200, status: "paid", paidAt: displayWithOffset(-61) },
  { id: 2, label: "Parcela 2/3", dueDate: displayWithOffset(-20), amount: 3200, status: "paid", paidAt: displayWithOffset(-20) },
  { id: 3, label: "Parcela 3/3", dueDate: displayWithOffset(20), amount: 3200, status: "pending" },
];

export const clientHistory: ClientHistoryItem[] = [
  { id: 1, date: displayWithOffset(-57), time: "10:15", type: "project", title: "Briefing recebido", description: "Documento inicial recebido e validado.", responsible: "Louis Evans", status: "Concluido", relatedHref: "/cliente/projeto" },
  { id: 2, date: displayWithOffset(-46), time: "14:30", type: "project", title: "Escopo aprovado", description: "Escopo e cronograma aprovados pelo cliente.", responsible: "Marina Costa", status: "Concluido", relatedHref: "/cliente/etapas" },
  { id: 3, date: displayWithOffset(-31), time: "17:10", type: "approval", title: "Direcao visual aprovada", description: "Moodboard aprovado sem solicitacao de ajuste.", responsible: "Marina Costa", status: "Aprovado", relatedHref: "/cliente/aprovacoes" },
  { id: 4, date: displayWithOffset(-8), time: "11:40", type: "request", title: "Nova solicitacao recebida", description: "Inclusao do servico de diagnostico empresarial.", responsible: "Marina Costa", status: "Respondido", relatedHref: "/cliente/solicitacoes" },
  { id: 5, date: displayWithOffset(-1), time: "16:00", type: "file", title: "Layout da home enviado", description: "Primeira versao disponibilizada para aprovacao.", responsible: "Bessie Stone", status: "Pendente", relatedHref: "/cliente/arquivos" },
];

export const clientRecentUpdates = clientHistory.slice().reverse().slice(0, 4);
