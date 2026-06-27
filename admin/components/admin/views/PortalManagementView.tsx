"use client";

import Link from "next/link";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Eye,
  FileText,
  Link2,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  UploadCloud,
  UserCheck,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  PORTAL_APPROVALS_SCOPED,
  PORTAL_BRIEFINGS,
  PORTAL_CLIENTS,
  PORTAL_FILES_SCOPED,
  PORTAL_FINANCE_SCOPED,
  PORTAL_HISTORY_SCOPED,
  PORTAL_PREVIEWS_SCOPED,
  PORTAL_PROJECTS_SCOPED,
  PORTAL_REQUESTS_SCOPED,
  PORTAL_SCHEDULE_SCOPED,
  PORTAL_STAGES_SCOPED,
} from "@/data/admin/admin-mock-data";
import type {
  PortalBriefingRecord,
  PortalBriefingStatus,
  PortalClientApprovalRecord,
  PortalClientApprovalStatus,
  PortalClientFileRecord,
  PortalClientFinanceRecord,
  PortalClientFinanceStatus,
  PortalClientHistoryRecord,
  PortalClientPreviewRecord,
  PortalClientRequestRecord,
  PortalClientRequestStatus,
  PortalClientScheduleRecord,
  PortalClientStageRecord,
  PortalClientStageStatus,
  PortalClientRecord,
  PortalProjectRecord,
  PortalProjectStatus,
  SupportPriority,
} from "@/types/admin";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminClientFilter } from "@/components/admin/ui/AdminClientFilter";
import { Badge } from "@/components/admin/ui/Badge";
import { Modal } from "@/components/admin/ui/Modal";

type PortalSection = "clients" | "workspace" | "projects" | "briefings" | "stages" | "approvals" | "requests" | "files" | "previews" | "schedule" | "billing" | "history";

type PortalManagementViewProps = {
  section?: PortalSection;
  clientId?: string;
};

type ScopedFilter = string | "all";

const inputClassName = "rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20";

const projectStatusVariant: Record<PortalProjectStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  "Rascunho interno": "gray",
  "Em producao": "blue",
  "Enviado ao cliente": "blue",
  "Aguardando cliente": "yellow",
  Concluido: "green",
  Arquivado: "gray",
};

const briefingStatusVariant: Record<PortalBriefingStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  "Rascunho interno": "gray",
  "Enviado ao cliente": "blue",
  Respondido: "yellow",
  "Em analise": "blue",
  Concluido: "green",
  Arquivado: "gray",
};

const stageStatusVariant: Record<PortalClientStageStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  "Rascunho interno": "gray",
  "Em producao": "blue",
  "Pronta para envio": "yellow",
  "Enviada ao cliente": "blue",
  "Aguardando aprovacao": "yellow",
  "Ajustes solicitados": "red",
  Aprovada: "green",
  Concluida: "green",
};

const approvalStatusVariant: Record<PortalClientApprovalStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  Rascunho: "gray",
  Enviado: "blue",
  "Aguardando cliente": "yellow",
  Aprovado: "green",
  "Ajustes solicitados": "red",
  Reenviado: "blue",
  Cancelado: "gray",
};

const requestStatusVariant: Record<PortalClientRequestStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  Nova: "yellow",
  "Em analise": "blue",
  "Em execucao": "blue",
  Concluida: "green",
  Arquivada: "gray",
};

const priorityVariant: Record<SupportPriority, "green" | "yellow" | "red" | "gray"> = {
  Baixa: "gray",
  Media: "yellow",
  Alta: "red",
  Urgente: "red",
};

const previewStatusVariant: Record<PortalClientPreviewRecord["status"], "green" | "yellow" | "red" | "gray" | "blue"> = {
  Rascunho: "gray",
  Enviado: "blue",
  "Em aprovacao": "yellow",
  Aprovado: "green",
  Arquivado: "gray",
};

const financeStatusVariant: Record<PortalClientFinanceStatus, "green" | "yellow" | "red"> = {
  Pago: "green",
  Pendente: "yellow",
  Atrasado: "red",
};

const workspaceTabs: readonly { id: PortalSection; label: string }[] = [
  { id: "clients", label: "Visao geral" },
  { id: "projects", label: "Projetos" },
  { id: "briefings", label: "Briefings" },
  { id: "stages", label: "Etapas" },
  { id: "approvals", label: "Aprovacoes" },
  { id: "requests", label: "Solicitacoes" },
  { id: "files", label: "Arquivos" },
  { id: "previews", label: "Previews" },
  { id: "schedule", label: "Cronograma" },
  { id: "billing", label: "Financeiro" },
  { id: "history", label: "Historico" },
];

function SectionTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F7F1] text-[#00B074]">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-[#A7F3D0] bg-[#E6F7F1] px-4 py-3 text-sm font-semibold text-[#00B074]">{children}</div>;
}

function getClient(clientId?: string) {
  return PORTAL_CLIENTS.find((client) => client.id === clientId);
}

function getProject(projectId?: string) {
  return PORTAL_PROJECTS_SCOPED.find((project) => project.id === projectId);
}

function clientName(clientId: string) {
  return getClient(clientId)?.company ?? "Cliente nao encontrado";
}

function projectName(projectId?: string) {
  return getProject(projectId)?.name ?? "Sem projeto";
}

function clientProjects(clientId: string) {
  return PORTAL_PROJECTS_SCOPED.filter((project) => project.clientId === clientId);
}

function isVisibleByClient<T extends { clientId: string }>(item: T, selectedClientId: ScopedFilter) {
  return selectedClientId === "all" || item.clientId === selectedClientId;
}

function firstProjectIdForClient(clientId: string) {
  return clientProjects(clientId)[0]?.id ?? "";
}

function ClientProjectFields({
  selectedClientId,
  projectId,
  onClientChange,
  onProjectChange,
  lockedClient,
  requireProject = true,
}: {
  selectedClientId: string;
  projectId?: string;
  onClientChange: (clientId: string) => void;
  onProjectChange?: (projectId: string) => void;
  lockedClient?: boolean;
  requireProject?: boolean;
}) {
  const projects = clientProjects(selectedClientId);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-semibold text-gray-700">
        Cliente
        <select value={selectedClientId} disabled={lockedClient} onChange={(event) => onClientChange(event.target.value)} className={inputClassName}>
          {PORTAL_CLIENTS.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-gray-700">
        Projeto {requireProject ? "" : "(opcional)"}
        <select value={projectId ?? ""} onChange={(event) => onProjectChange?.(event.target.value)} className={inputClassName}>
          {!requireProject ? <option value="">Sem projeto</option> : null}
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </label>
    </div>
  );
}

function ClientSummary({ selectedClientId }: { selectedClientId: ScopedFilter }) {
  const client = getClient(selectedClientId === "all" ? undefined : selectedClientId);
  const visibleProjects = PORTAL_PROJECTS_SCOPED.filter((project) => selectedClientId === "all" || project.clientId === selectedClientId);
  const pendingApprovals = PORTAL_APPROVALS_SCOPED.filter((approval) => isVisibleByClient(approval, selectedClientId) && ["Aguardando cliente", "Enviado", "Reenviado"].includes(approval.status)).length;
  const openRequests = PORTAL_REQUESTS_SCOPED.filter((request) => isVisibleByClient(request, selectedClientId) && request.status !== "Concluida" && request.status !== "Arquivada").length;
  const financePending = PORTAL_FINANCE_SCOPED.filter((invoice) => isVisibleByClient(invoice, selectedClientId) && invoice.status !== "Pago").length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={<UserCheck className="h-5 w-5" />} label={client ? "Cliente" : "Clientes no portal"} value={client ? client.company : PORTAL_CLIENTS.length} />
      <StatCard icon={<FileText className="h-5 w-5" />} label="Projetos vinculados" value={visibleProjects.length} />
      <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Aprovacoes pendentes" value={pendingApprovals} />
      <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Solicitacoes abertas" value={openRequests + financePending} />
    </div>
  );
}

function PortalClients() {
  return (
    <div className="space-y-6">
      <SectionTitle title="Clientes do Portal" description="Entrada principal do Portal do Cliente. Cada card abre um workspace isolado por cliente." />
      <ClientSummary selectedClientId="all" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {PORTAL_CLIENTS.map((client) => {
          const projects = clientProjects(client.id);
          const pendingApprovals = PORTAL_APPROVALS_SCOPED.filter((approval) => approval.clientId === client.id && approval.status === "Aguardando cliente").length;
          const openRequests = PORTAL_REQUESTS_SCOPED.filter((request) => request.clientId === client.id && request.status !== "Concluida" && request.status !== "Arquivada").length;
          const activeProject = projects.find((project) => project.id === client.activeProjectId) ?? projects[0];

          return (
            <div key={client.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant={client.accountStatus === "Ativa" ? "green" : client.accountStatus === "Inativa" ? "gray" : "yellow"}>{client.accountStatus}</Badge>
                    <Badge variant="gray">{client.plan}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{client.company}</h3>
                  <p className="text-sm text-gray-500">{client.name} - {client.email}</p>
                </div>
                <Link href={`/portal-do-cliente/clientes/${client.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00B074] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#009662]">
                  Gerenciar portal
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Projetos</p><p className="font-bold text-gray-900">{projects.length}</p></div>
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Aprovacoes</p><p className="font-bold text-gray-900">{pendingApprovals}</p></div>
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Solicitacoes</p><p className="font-bold text-gray-900">{openRequests}</p></div>
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Responsavel</p><p className="font-bold text-gray-900">{client.responsible}</p></div>
              </div>
              <div className="mt-4 rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Projeto ativo principal</p>
                <p className="mt-1 font-bold text-gray-900">{activeProject?.name ?? "Sem projeto"}</p>
                <p className="mt-1 text-sm text-gray-500">{client.lastActivity}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientWorkspace({ clientId }: { clientId: string }) {
  const client = getClient(clientId);
  const [tab, setTab] = useState<PortalSection>("clients");
  const [quickAction, setQuickAction] = useState<PortalSection | null>(null);

  if (!client) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Cliente nao encontrado</h2>
        <p className="mt-2 text-sm text-gray-500">Volte para Clientes do Portal e escolha um cliente existente.</p>
      </div>
    );
  }

  const workspaceClient: PortalClientRecord = client;
  const projects = clientProjects(workspaceClient.id);
  const currentStage = PORTAL_STAGES_SCOPED.find((stage) => stage.clientId === workspaceClient.id && stage.approvalPending) ?? PORTAL_STAGES_SCOPED.find((stage) => stage.clientId === workspaceClient.id);
  const files = PORTAL_FILES_SCOPED.filter((file) => file.clientId === workspaceClient.id).slice(0, 3);
  const events = PORTAL_SCHEDULE_SCOPED.filter((event) => event.clientId === workspaceClient.id).slice(0, 3);
  const financePending = PORTAL_FINANCE_SCOPED.filter((item) => item.clientId === workspaceClient.id && item.status !== "Pago");

  function renderTab() {
    switch (tab) {
      case "projects": return <PortalProjects forcedClientId={workspaceClient.id} />;
      case "briefings": return <PortalBriefings forcedClientId={workspaceClient.id} />;
      case "stages": return <PortalStages forcedClientId={workspaceClient.id} />;
      case "approvals": return <PortalApprovals forcedClientId={workspaceClient.id} />;
      case "requests": return <PortalRequests forcedClientId={workspaceClient.id} />;
      case "files": return <PortalFiles forcedClientId={workspaceClient.id} />;
      case "previews": return <PortalPreviews forcedClientId={workspaceClient.id} />;
      case "schedule": return <PortalSchedule forcedClientId={workspaceClient.id} />;
      case "billing": return <PortalBilling forcedClientId={workspaceClient.id} />;
      case "history": return <PortalHistory forcedClientId={workspaceClient.id} />;
      default:
        return (
          <div className="space-y-6">
            <ClientSummary selectedClientId={workspaceClient.id} />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
                <h3 className="mb-4 font-bold text-gray-900">Dados do cliente</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Empresa</p><p className="font-bold text-gray-900">{workspaceClient.company}</p></div>
                  <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Login</p><p className="font-bold text-gray-900">{workspaceClient.email}</p></div>
                  <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Plano</p><p className="font-bold text-gray-900">{workspaceClient.plan}</p></div>
                  <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Responsavel</p><p className="font-bold text-gray-900">{workspaceClient.responsible}</p></div>
                  <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Etapa atual</p><p className="font-bold text-gray-900">{currentStage?.name ?? "Sem etapa"}</p></div>
                  <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Progresso geral</p><p className="font-bold text-[#00B074]">{Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / Math.max(projects.length, 1))}%</p></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    ["projects", "Novo projeto"],
                    ["briefings", "Novo briefing"],
                    ["stages", "Nova etapa"],
                    ["previews", "Enviar preview"],
                    ["files", "Enviar arquivo"],
                    ["billing", "Criar cobranca"],
                    ["schedule", "Criar evento"],
                  ].map(([id, label]) => (
                    <AdminButton key={id} variant="secondary" onClick={() => setQuickAction(id as PortalSection)}>{label}</AdminButton>
                  ))}
                  <AdminButton>Ver portal do cliente</AdminButton>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="mb-3 font-bold text-gray-900">Arquivos recentes</h3>{files.map((file) => <p key={file.id} className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">{file.name}</p>)}</div>
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="mb-3 font-bold text-gray-900">Proximos eventos</h3>{events.map((event) => <p key={event.id} className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">{event.title} - {event.date}</p>)}</div>
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="mb-3 font-bold text-gray-900">Pendencias financeiras</h3>{financePending.length ? financePending.map((item) => <p key={item.id} className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">{item.description} - {item.status}</p>) : <p className="text-sm text-gray-500">Sem pendencias.</p>}</div>
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href="/portal-do-cliente/clientes" className="text-sm font-semibold text-[#00B074] hover:text-[#009662]">Portal do Cliente</Link>
        <SectionTitle title={`Portal do Cliente > ${workspaceClient.company}`} description="Workspace isolado por cliente. Todos os itens criados aqui ficam vinculados a este cliente." />
      </div>
      <div className="flex gap-2 overflow-x-auto rounded-3xl border border-gray-100 bg-white p-2 shadow-sm">
        {workspaceTabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${tab === item.id ? "bg-[#00B074] text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
            {item.label}
          </button>
        ))}
      </div>
      {quickAction ? <Notice>Acao rapida aberta com cliente bloqueado: {workspaceClient.company}. Use a aba {workspaceTabs.find((item) => item.id === quickAction)?.label} para salvar o item.</Notice> : null}
      {renderTab()}
    </div>
  );
}

function PortalProjects({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [projects, setProjects] = useState<PortalProjectRecord[]>([...PORTAL_PROJECTS_SCOPED]);
  const [draft, setDraft] = useState<PortalProjectRecord | null>(null);
  const [deleteProject, setDeleteProject] = useState<PortalProjectRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredProjects = projects.filter((project) => isVisibleByClient(project, selectedClientId));

  function openCreate() {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar projeto. Criacao global nao e permitida.");
      return;
    }
    setDraft({ id: `project-local-${Date.now()}`, clientId: selectedClientId, name: "Novo projeto", type: "Landing page", scope: "Escopo do projeto", status: "Rascunho interno", progress: 0, responsible: getClient(selectedClientId)?.responsible ?? "Ateliux", deadline: "Hoje", currentStage: "Planejamento", visibleToClient: false });
  }

  function saveProject() {
    if (!draft) return;
    setProjects((current) => current.some((project) => project.id === draft.id) ? current.map((project) => project.id === draft.id ? draft : project) : [draft, ...current]);
    setNotice(`Projeto salvo para o cliente ${clientName(draft.clientId)}.`);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Projetos do Portal" description="Projetos sempre pertencem a um cliente especifico." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Novo projeto</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <ClientSummary selectedClientId={selectedClientId} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredProjects.map((project) => (
          <div key={project.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{clientName(project.clientId)}</p><h3 className="font-bold text-gray-900">{project.name}</h3><p className="text-sm text-gray-500">{project.type} - {project.scope}</p></div>
              <Badge variant={projectStatusVariant[project.status]}>{project.status}</Badge>
            </div>
            <div className="mb-3 h-2 rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#00B074]" style={{ width: `${project.progress}%` }} /></div>
            <p className="text-sm text-gray-500">Responsavel: {project.responsible} - Prazo: {project.deadline} - Etapa: {project.currentStage}</p>
            <p className="mt-2 text-xs text-gray-400">{project.visibleToClient ? "Visivel no portal" : "Rascunho interno"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <AdminButton variant="secondary" onClick={() => setDraft(project)}><Edit3 className="h-4 w-4" /> Editar</AdminButton>
              <AdminButton variant="secondary" onClick={() => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, visibleToClient: true, status: "Enviado ao cliente" } : item))}><Send className="h-4 w-4" /> Enviar</AdminButton>
              <AdminButton variant="secondary" onClick={() => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, progress: Math.min(100, item.progress + 10) } : item))}>Avancar</AdminButton>
              <AdminButton variant="danger" onClick={() => setDeleteProject(project)}><Trash2 className="h-4 w-4" /> Excluir</AdminButton>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Projeto do cliente" size="lg">
        {draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.id} lockedClient={Boolean(forcedClientId)} requireProject={false} onClientChange={(clientId) => setDraft({ ...draft, clientId })} /><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-gray-700">Nome<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Tipo<input value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Progresso<input type="number" min={0} max={100} value={draft.progress} onChange={(event) => setDraft({ ...draft, progress: Number(event.target.value) })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as PortalProjectStatus })} className={inputClassName}><option>Rascunho interno</option><option>Em producao</option><option>Enviado ao cliente</option><option>Aguardando cliente</option><option>Concluido</option><option>Arquivado</option></select></label></div><label className="grid gap-2 text-sm font-semibold text-gray-700">Escopo<textarea value={draft.scope} onChange={(event) => setDraft({ ...draft, scope: event.target.value })} rows={3} className={`${inputClassName} resize-none`} /></label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={saveProject}>Salvar</AdminButton></div></div> : null}
      </Modal>
      <Modal isOpen={Boolean(deleteProject)} onClose={() => setDeleteProject(null)} title="Excluir projeto">{deleteProject ? <div className="space-y-5"><p className="text-sm text-gray-600">Excluir <strong>{deleteProject.name}</strong> de {clientName(deleteProject.clientId)}?</p><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDeleteProject(null)}>Cancelar</AdminButton><AdminButton variant="danger" onClick={() => { setProjects((current) => current.filter((project) => project.id !== deleteProject.id)); setDeleteProject(null); }}>Excluir</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalBriefings({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [briefings, setBriefings] = useState<PortalBriefingRecord[]>([...PORTAL_BRIEFINGS]);
  const [draft, setDraft] = useState<PortalBriefingRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredBriefings = briefings.filter((briefing) => isVisibleByClient(briefing, selectedClientId));

  function openCreate() {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar briefing. Criacao global nao e permitida.");
      return;
    }
    setDraft({ id: `briefing-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), title: "Novo briefing", type: "Produto", description: "Descricao do briefing", status: "Rascunho interno", createdBy: "Ateliux", sentTo: getClient(selectedClientId)?.name ?? "Cliente", createdAt: "Agora", visibleToClient: false });
  }

  function saveBriefing() {
    if (!draft) return;
    setBriefings((current) => current.some((briefing) => briefing.id === draft.id) ? current.map((briefing) => briefing.id === draft.id ? draft : briefing) : [draft, ...current]);
    setNotice(`Briefing salvo para ${clientName(draft.clientId)}.`);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Briefings" description="Briefings sao enviados para um cliente especifico e nunca globais." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Novo briefing</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500"><tr><th className="rounded-l-xl p-4">Briefing</th><th className="p-4">Cliente</th><th className="p-4">Projeto</th><th className="p-4">Status</th><th className="p-4">Portal</th><th className="rounded-r-xl p-4 text-right">Acoes</th></tr></thead><tbody className="divide-y divide-gray-50">{filteredBriefings.map((briefing) => <tr key={briefing.id} className="hover:bg-gray-50"><td className="p-4"><p className="font-bold text-gray-900">{briefing.title}</p><p className="text-xs text-gray-500">{briefing.type} - {briefing.description}</p></td><td className="p-4 text-sm text-gray-600">{clientName(briefing.clientId)}</td><td className="p-4 text-sm text-gray-600">{projectName(briefing.projectId)}</td><td className="p-4"><Badge variant={briefingStatusVariant[briefing.status]}>{briefing.status}</Badge></td><td className="p-4 text-sm text-gray-500">{briefing.visibleToClient ? "Visivel" : "Interno"}</td><td className="p-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setDraft(briefing)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Editar briefing"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => { setBriefings((current) => current.map((item) => item.id === briefing.id ? { ...item, status: "Enviado ao cliente", visibleToClient: true, sentAt: "Agora" } : item)); setNotice(`Briefing enviado para ${clientName(briefing.clientId)}.`); }} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Enviar briefing"><Send className="h-4 w-4" /></button><button type="button" onClick={() => setBriefings((current) => current.map((item) => item.id === briefing.id ? { ...item, status: "Em analise" } : item))} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Analisado</button><button type="button" onClick={() => setBriefings((current) => current.map((item) => item.id === briefing.id ? { ...item, status: "Arquivado" } : item))} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Arquivar briefing"><Archive className="h-4 w-4" /></button><button type="button" onClick={() => setBriefings((current) => current.filter((item) => item.id !== briefing.id))} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir briefing"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
      </div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Briefing do cliente" size="lg">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient={Boolean(forcedClientId)} requireProject={false} onClientChange={(clientId) => setDraft({ ...draft, clientId, projectId: firstProjectIdForClient(clientId) })} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} /><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-gray-700">Titulo<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as PortalBriefingStatus })} className={inputClassName}><option>Rascunho interno</option><option>Enviado ao cliente</option><option>Respondido</option><option>Em analise</option><option>Concluido</option><option>Arquivado</option></select></label></div><label className="grid gap-2 text-sm font-semibold text-gray-700">Descricao<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} className={`${inputClassName} resize-none`} /></label><label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={draft.visibleToClient} onChange={(event) => setDraft({ ...draft, visibleToClient: event.target.checked })} /> Visivel no portal</label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={saveBriefing}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalStages({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [stages, setStages] = useState<PortalClientStageRecord[]>([...PORTAL_STAGES_SCOPED]);
  const [draft, setDraft] = useState<PortalClientStageRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredStages = stages.filter((stage) => isVisibleByClient(stage, selectedClientId));

  function openCreate() {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar etapa. A etapa tambem exige projeto.");
      return;
    }
    setDraft({ id: `stage-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), name: "Nova etapa", responsible: getClient(selectedClientId)?.responsible ?? "Ateliux", internalStatus: "Rascunho interno", clientStatus: "Ainda nao visivel", sentToClient: false, approvalPending: false, deadline: "Hoje", lastUpdate: "Criada agora" });
  }

  function saveStage() {
    const currentDraft = draft;
    if (!currentDraft?.projectId) return;
    setStages((current) => current.some((stage) => stage.id === currentDraft.id) ? current.map((stage) => stage.id === currentDraft.id ? currentDraft : stage) : [currentDraft, ...current]);
    setNotice(`Etapa salva para ${clientName(currentDraft.clientId)} no projeto ${projectName(currentDraft.projectId)}.`);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Etapas" description="Etapas pertencem a cliente e projeto; nada e enviado globalmente." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Nova etapa</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left"><thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500"><tr><th className="rounded-l-xl p-4">Etapa</th><th className="p-4">Cliente</th><th className="p-4">Projeto</th><th className="p-4">Status interno</th><th className="p-4">Status cliente</th><th className="p-4">Prazo</th><th className="rounded-r-xl p-4 text-right">Acoes</th></tr></thead><tbody className="divide-y divide-gray-50">{filteredStages.map((stage) => <tr key={stage.id} className="hover:bg-gray-50"><td className="p-4"><p className="font-bold text-gray-900">{stage.name}</p><p className="text-xs text-gray-500">{stage.responsible} - {stage.lastUpdate}</p></td><td className="p-4 text-sm text-gray-600">{clientName(stage.clientId)}</td><td className="p-4 text-sm text-gray-600">{projectName(stage.projectId)}</td><td className="p-4"><Badge variant={stageStatusVariant[stage.internalStatus]}>{stage.internalStatus}</Badge></td><td className="p-4 text-sm text-gray-500">{stage.clientStatus}</td><td className="p-4 text-sm text-gray-500">{stage.deadline}</td><td className="p-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setDraft(stage)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Editar etapa"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => setStages((current) => current.map((item) => item.id === stage.id ? { ...item, sentToClient: true, internalStatus: "Enviada ao cliente", clientStatus: "Enviada ao cliente", lastUpdate: "Enviada agora" } : item))} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Enviar etapa"><Send className="h-4 w-4" /></button><button type="button" onClick={() => setStages((current) => current.map((item) => item.id === stage.id ? { ...item, approvalPending: true, internalStatus: "Aguardando aprovacao", clientStatus: "Aguardando aprovacao" } : item))} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Aprovar</button><button type="button" onClick={() => setStages((current) => current.map((item) => item.id === stage.id ? { ...item, internalStatus: "Concluida", clientStatus: "Concluida", approvalPending: false } : item))} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Concluir</button><button type="button" onClick={() => setStages((current) => current.filter((item) => item.id !== stage.id))} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir etapa"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Etapa do projeto" size="lg">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient={Boolean(forcedClientId)} onClientChange={(clientId) => setDraft({ ...draft, clientId, projectId: firstProjectIdForClient(clientId) })} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} /><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-gray-700">Nome<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Status<select value={draft.internalStatus} onChange={(event) => setDraft({ ...draft, internalStatus: event.target.value as PortalClientStageStatus })} className={inputClassName}><option>Rascunho interno</option><option>Em producao</option><option>Pronta para envio</option><option>Enviada ao cliente</option><option>Aguardando aprovacao</option><option>Ajustes solicitados</option><option>Aprovada</option><option>Concluida</option></select></label></div><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={saveStage}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalApprovals({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [approvals, setApprovals] = useState<PortalClientApprovalRecord[]>([...PORTAL_APPROVALS_SCOPED]);
  const [draft, setDraft] = useState<PortalClientApprovalRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredApprovals = approvals.filter((approval) => isVisibleByClient(approval, selectedClientId));

  function openCreate() {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar aprovacao.");
      return;
    }
    const client = getClient(selectedClientId);
    setDraft({ id: `approval-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), title: "Nova aprovacao", type: "Preview", previewUrl: "https://preview.ateliux.dev/novo", message: `Enviar preview para: ${client?.company ?? "Cliente"}`, sentBy: "Ateliux", sentTo: client?.name ?? "Cliente", status: "Rascunho" });
  }

  function saveApproval() {
    const currentDraft = draft;
    if (!currentDraft?.projectId) return;
    setApprovals((current) => current.some((approval) => approval.id === currentDraft.id) ? current.map((approval) => approval.id === currentDraft.id ? currentDraft : approval) : [currentDraft, ...current]);
    setNotice(`Aprovacao salva para ${clientName(currentDraft.clientId)}.`);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Aprovacoes" description="Aprovacoes e previews sempre sao enviados para um cliente especifico." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Criar aprovacao</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{filteredApprovals.map((approval) => <div key={approval.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><Badge variant={approvalStatusVariant[approval.status]}>{approval.status}</Badge><h3 className="mt-4 font-bold text-gray-900">{approval.title}</h3><p className="mt-1 text-sm text-gray-500">{clientName(approval.clientId)} - {projectName(approval.projectId)}</p><p className="mt-3 text-xs text-gray-400">{approval.message}</p><div className="mt-5 flex flex-wrap gap-2"><a href={approval.previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"><Eye className="h-4 w-4" /> Abrir</a><AdminButton variant="secondary" onClick={() => setDraft(approval)}>Editar</AdminButton><AdminButton onClick={() => { setApprovals((current) => current.map((item) => item.id === approval.id ? { ...item, status: "Aguardando cliente", sentAt: "Agora" } : item)); setNotice(`Enviar preview para: ${clientName(approval.clientId)}.`); }}><Send className="h-4 w-4" /> Enviar</AdminButton><AdminButton variant="secondary" onClick={() => setApprovals((current) => current.map((item) => item.id === approval.id ? { ...item, status: "Aprovado", clientResponse: "Aprovacao manual registrada" } : item))}>Aprovar</AdminButton><AdminButton variant="secondary" onClick={() => setApprovals((current) => current.map((item) => item.id === approval.id ? { ...item, status: "Ajustes solicitados", clientResponse: "Ajustes registrados manualmente" } : item))}>Ajustes</AdminButton><AdminButton variant="danger" onClick={() => setApprovals((current) => current.filter((item) => item.id !== approval.id))}><Trash2 className="h-4 w-4" /> Excluir</AdminButton></div></div>)}</div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Aprovacao do cliente" size="lg">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient={Boolean(forcedClientId)} onClientChange={(clientId) => setDraft({ ...draft, clientId, projectId: firstProjectIdForClient(clientId), message: `Enviar preview para: ${clientName(clientId)}` })} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} /><label className="grid gap-2 text-sm font-semibold text-gray-700">Titulo<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Link do preview<input value={draft.previewUrl} onChange={(event) => setDraft({ ...draft, previewUrl: event.target.value })} className={inputClassName} /></label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={saveApproval}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalRequests({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [requests, setRequests] = useState<PortalClientRequestRecord[]>([...PORTAL_REQUESTS_SCOPED]);
  const [draft, setDraft] = useState<PortalClientRequestRecord | null>(null);
  const filteredRequests = requests.filter((request) => isVisibleByClient(request, selectedClientId));

  return (
    <div className="space-y-6">
      <SectionTitle title="Solicitacoes" description="Solicitacoes sao recebidas de clientes especificos e vinculadas a conversas da Caixa de Entrada." />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left"><thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500"><tr><th className="rounded-l-xl p-4">Solicitacao</th><th className="p-4">Cliente</th><th className="p-4">Projeto</th><th className="p-4">Prioridade</th><th className="p-4">Status</th><th className="p-4">Inbox</th><th className="rounded-r-xl p-4 text-right">Acoes</th></tr></thead><tbody className="divide-y divide-gray-50">{filteredRequests.map((request) => <tr key={request.id} className="hover:bg-gray-50"><td className="p-4"><p className="font-bold text-gray-900">{request.title}</p><p className="text-xs text-gray-500">{request.description}</p></td><td className="p-4 text-sm text-gray-600">{clientName(request.clientId)}</td><td className="p-4 text-sm text-gray-600">{projectName(request.projectId)}</td><td className="p-4"><Badge variant={priorityVariant[request.priority]}>{request.priority}</Badge></td><td className="p-4"><Badge variant={requestStatusVariant[request.status]}>{request.status}</Badge></td><td className="p-4 text-xs text-gray-500">{request.inboxConversationId}</td><td className="p-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setDraft(request)} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Responder</button><button type="button" onClick={() => setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: "Em execucao" } : item))} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Converter em tarefa"><Workflow className="h-4 w-4" /></button><button type="button" onClick={() => setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: "Concluida" } : item))} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Concluir</button><button type="button" onClick={() => setRequests((current) => current.filter((item) => item.id !== request.id))} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir solicitacao"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Responder solicitacao" size="lg">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient onClientChange={() => undefined} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} requireProject={false} /><label className="grid gap-2 text-sm font-semibold text-gray-700">Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as PortalClientRequestStatus })} className={inputClassName}><option>Nova</option><option>Em analise</option><option>Em execucao</option><option>Concluida</option><option>Arquivada</option></select></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Resposta / descricao<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} className={`${inputClassName} resize-none`} /></label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={() => { setRequests((current) => current.map((item) => item.id === draft.id ? draft : item)); setDraft(null); }}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalFiles({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [files, setFiles] = useState<PortalClientFileRecord[]>([...PORTAL_FILES_SCOPED]);
  const [draft, setDraft] = useState<PortalClientFileRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<PortalClientFileRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredFiles = files.filter((file) => isVisibleByClient(file, selectedClientId));

  function openCreate(origin: "Ateliux" | "Cliente") {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de enviar arquivo.");
      return;
    }
    const client = getClient(selectedClientId);
    setDraft({ id: `file-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), name: "novo-arquivo.pdf", type: "PDF", origin, sentBy: origin === "Ateliux" ? "Ateliux" : client?.name ?? "Cliente", sentTo: origin === "Ateliux" ? client?.name ?? "Cliente" : "Ateliux", visibleToClient: origin === "Ateliux", linkedTo: "Projeto", size: "420 KB", createdAt: "Agora" });
  }

  function saveFile() {
    if (!draft) return;
    setFiles((current) => current.some((file) => file.id === draft.id) ? current.map((file) => file.id === draft.id ? draft : file) : [draft, ...current]);
    setNotice(`${draft.origin === "Ateliux" ? "Enviar arquivo para o cliente" : "Arquivo recebido de"} ${clientName(draft.clientId)}.`);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Arquivos" description="Arquivos mostram origem, destinatario, cliente, projeto e visibilidade no portal." action={<div className="flex flex-wrap gap-2"><AdminButton onClick={() => openCreate("Ateliux")}><UploadCloud className="h-4 w-4" /> Enviar arquivo</AdminButton><AdminButton variant="secondary" onClick={() => openCreate("Cliente")}>Receber arquivo</AdminButton></div>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{filteredFiles.map((file) => <div key={file.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><FileText className="mb-4 h-8 w-8 text-[#00B074]" /><h3 className="font-bold text-gray-900">{file.name}</h3><p className="mt-1 text-sm text-gray-500">{clientName(file.clientId)} - {projectName(file.projectId)}</p><p className="mt-3 text-xs text-gray-400">{file.origin} - enviado por {file.sentBy} para {file.sentTo}</p><p className="mt-1 text-xs text-gray-400">{file.visibleToClient ? "Visivel no portal" : "Interno"} - Vinculo: {file.linkedTo}</p><div className="mt-5 flex flex-wrap gap-2"><AdminButton variant="secondary" onClick={() => setSelectedFile(file)}><Eye className="h-4 w-4" /> Ver</AdminButton><AdminButton variant="secondary" onClick={() => setDraft(file)}><Edit3 className="h-4 w-4" /> Editar</AdminButton><AdminButton><Download className="h-4 w-4" /> Baixar</AdminButton><AdminButton variant="danger" onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}><Trash2 className="h-4 w-4" /> Excluir</AdminButton></div></div>)}</div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.origin === "Ateliux" ? `Enviar arquivo para o cliente ${draft ? clientName(draft.clientId) : ""}` : "Editar arquivo"} size="lg">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient={Boolean(forcedClientId)} requireProject={false} onClientChange={(clientId) => setDraft({ ...draft, clientId, projectId: firstProjectIdForClient(clientId) })} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} /><label className="grid gap-2 text-sm font-semibold text-gray-700">Nome<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Vinculo<input value={draft.linkedTo} onChange={(event) => setDraft({ ...draft, linkedTo: event.target.value })} className={inputClassName} /></label><label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={draft.visibleToClient} onChange={(event) => setDraft({ ...draft, visibleToClient: event.target.checked })} /> Visivel no portal</label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={saveFile}>Salvar</AdminButton></div></div> : null}</Modal>
      <Modal isOpen={Boolean(selectedFile)} onClose={() => setSelectedFile(null)} title="Visualizar arquivo">{selectedFile ? <div className="space-y-4"><Badge variant="blue">{selectedFile.type}</Badge><h3 className="text-lg font-bold text-gray-900">{selectedFile.name}</h3><p className="text-sm text-gray-600">Arquivo de {clientName(selectedFile.clientId)} vinculado a {selectedFile.linkedTo}.</p></div> : null}</Modal>
    </div>
  );
}

function PortalPreviews({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [previews, setPreviews] = useState<PortalClientPreviewRecord[]>([...PORTAL_PREVIEWS_SCOPED]);
  const [approvals, setApprovals] = useState<PortalClientApprovalRecord[]>([...PORTAL_APPROVALS_SCOPED]);
  const [draft, setDraft] = useState<PortalClientPreviewRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredPreviews = previews.filter((preview) => isVisibleByClient(preview, selectedClientId));

  function openCreate() {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar preview.");
      return;
    }
    setDraft({ id: `preview-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), title: "Novo preview", url: "https://preview.ateliux.dev/novo", status: "Rascunho", version: "v1", createdAt: "Agora" });
  }

  function savePreview() {
    if (!draft?.projectId) return;
    setPreviews((current) => current.some((preview) => preview.id === draft.id) ? current.map((preview) => preview.id === draft.id ? draft : preview) : [draft, ...current]);
    setNotice(`Preview salvo para ${clientName(draft.clientId)}.`);
    setDraft(null);
  }

  function sendApproval(preview: PortalClientPreviewRecord) {
    const approval: PortalClientApprovalRecord = { id: `approval-from-${preview.id}-${approvals.length + 1}`, clientId: preview.clientId, projectId: preview.projectId, title: preview.title, type: "Preview", previewUrl: preview.url, message: `Enviar preview para: ${clientName(preview.clientId)}`, sentBy: "Ateliux", sentTo: getClient(preview.clientId)?.name ?? "Cliente", status: "Aguardando cliente", sentAt: "Agora" };
    setPreviews((current) => current.map((item) => item.id === preview.id ? { ...item, status: "Em aprovacao", sentAt: "Agora" } : item));
    setApprovals((current) => [approval, ...current]);
    setNotice(`Enviar preview para: ${clientName(preview.clientId)}.`);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Previews" description="Previews pertencem a cliente e projeto; envio gera aprovacao especifica." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Novo preview</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{filteredPreviews.map((preview) => <div key={preview.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><Badge variant={previewStatusVariant[preview.status]}>{preview.status}</Badge><h3 className="mt-4 font-bold text-gray-900">{preview.title}</h3><p className="mt-1 text-sm text-gray-500">{clientName(preview.clientId)} - {projectName(preview.projectId)}</p><p className="mt-3 text-xs text-gray-400">{preview.version} - criado {preview.createdAt} - enviado {preview.sentAt ?? "-"}</p><div className="mt-5 flex flex-wrap gap-2"><a href={preview.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"><Eye className="h-4 w-4" /> Abrir</a><AdminButton variant="secondary" onClick={() => setDraft(preview)}>Editar</AdminButton><AdminButton onClick={() => sendApproval(preview)}><Send className="h-4 w-4" /> Enviar</AdminButton><AdminButton variant="secondary" onClick={() => setPreviews((current) => current.map((item) => item.id === preview.id ? { ...item, status: "Arquivado" } : item))}><Archive className="h-4 w-4" /> Arquivar</AdminButton><AdminButton variant="danger" onClick={() => setPreviews((current) => current.filter((item) => item.id !== preview.id))}><Trash2 className="h-4 w-4" /> Excluir</AdminButton></div></div>)}</div>
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><h3 className="mb-4 font-bold text-gray-900">Aprovacoes conectadas aos previews</h3><div className="grid gap-3 md:grid-cols-3">{approvals.filter((approval) => isVisibleByClient(approval, selectedClientId)).slice(0, 6).map((approval) => <div key={approval.id} className="rounded-2xl bg-gray-50 p-4"><Badge variant={approvalStatusVariant[approval.status]}>{approval.status}</Badge><p className="mt-3 font-semibold text-gray-900">{approval.title}</p><p className="text-xs text-gray-500">{clientName(approval.clientId)}</p></div>)}</div></div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Preview do cliente" size="lg">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient={Boolean(forcedClientId)} onClientChange={(clientId) => setDraft({ ...draft, clientId, projectId: firstProjectIdForClient(clientId) })} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} /><label className="grid gap-2 text-sm font-semibold text-gray-700">Titulo<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">URL<input value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} className={inputClassName} /></label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={savePreview}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalSchedule({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [items, setItems] = useState<PortalClientScheduleRecord[]>([...PORTAL_SCHEDULE_SCOPED]);
  const [draft, setDraft] = useState<PortalClientScheduleRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredItems = items.filter((item) => isVisibleByClient(item, selectedClientId));

  function openCreate() {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar evento.");
      return;
    }
    setDraft({ id: `schedule-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), title: "Novo evento", type: "Entrega", date: "Hoje", time: "10:00", responsible: getClient(selectedClientId)?.responsible ?? "Ateliux", visibleToClient: false, status: "Interno", notes: "Evento criado no admin." });
  }

  function saveItem() {
    if (!draft) return;
    setItems((current) => current.some((item) => item.id === draft.id) ? current.map((item) => item.id === draft.id ? draft : item) : [draft, ...current]);
    setNotice(`Evento salvo para ${clientName(draft.clientId)}.`);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Cronograma" description="Eventos sao criados para cliente especifico e podem ser mostrados/ocultados no portal." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Novo evento</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{filteredItems.map((item) => <div key={item.id} className="flex gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6F7F1] text-[#00B074]"><CalendarDays className="h-6 w-6" /></div><div className="flex-1"><div className="flex items-center justify-between gap-3"><Badge variant="blue">{item.type}</Badge><Badge variant={item.visibleToClient ? "green" : "gray"}>{item.visibleToClient ? "Visivel" : "Interno"}</Badge></div><h3 className="mt-3 font-bold text-gray-900">{item.title}</h3><p className="mt-1 text-sm text-gray-500">{clientName(item.clientId)} - {projectName(item.projectId)} - {item.date} as {item.time}</p><p className="mt-2 text-xs text-gray-400">{item.notes}</p><div className="mt-4 flex flex-wrap gap-2"><AdminButton variant="secondary" onClick={() => setDraft(item)}>Editar</AdminButton><AdminButton variant="secondary" onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, visibleToClient: !entry.visibleToClient, status: entry.visibleToClient ? "Interno" : "Visivel no portal" } : entry))}>{item.visibleToClient ? "Ocultar" : "Mostrar"}</AdminButton><AdminButton variant="secondary" onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "Reagendado", date: "Nova data" } : entry))}>Reagendar</AdminButton><AdminButton variant="danger" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>Excluir</AdminButton></div></div></div>)}</div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Evento do cliente">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient={Boolean(forcedClientId)} requireProject={false} onClientChange={(clientId) => setDraft({ ...draft, clientId, projectId: firstProjectIdForClient(clientId) })} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} /><label className="grid gap-2 text-sm font-semibold text-gray-700">Titulo<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClassName} /></label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={saveItem}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalBilling({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [invoices, setInvoices] = useState<PortalClientFinanceRecord[]>([...PORTAL_FINANCE_SCOPED]);
  const [draft, setDraft] = useState<PortalClientFinanceRecord | null>(null);
  const [notice, setNotice] = useState("");
  const filteredInvoices = invoices.filter((invoice) => isVisibleByClient(invoice, selectedClientId));

  function openCreate() {
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar cobranca.");
      return;
    }
    setDraft({ id: `finance-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), plan: getClient(selectedClientId)?.plan ?? "Essencial", description: "Nova cobranca", amount: "R$ 0", dueDate: "Hoje", status: "Pendente", installment: "1/1", visibleToClient: true });
  }

  function saveInvoice() {
    if (!draft) return;
    setInvoices((current) => current.some((invoice) => invoice.id === draft.id) ? current.map((invoice) => invoice.id === draft.id ? draft : invoice) : [draft, ...current]);
    setNotice(`Cobranca salva para ${clientName(draft.clientId)}.`);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Financeiro" description="Cobrancas e recibos sao sempre por cliente." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Criar cobranca</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      {notice ? <Notice>{notice}</Notice> : null}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left"><thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500"><tr><th className="rounded-l-xl p-4">Cobranca</th><th className="p-4">Cliente</th><th className="p-4">Projeto</th><th className="p-4">Valor</th><th className="p-4">Vencimento</th><th className="p-4">Status</th><th className="rounded-r-xl p-4 text-right">Acoes</th></tr></thead><tbody className="divide-y divide-gray-50">{filteredInvoices.map((invoice) => <tr key={invoice.id} className="hover:bg-gray-50"><td className="p-4"><p className="font-bold text-gray-900">{invoice.description}</p><p className="text-xs text-gray-500">{invoice.plan} - Parcela {invoice.installment}</p></td><td className="p-4 text-sm text-gray-600">{clientName(invoice.clientId)}</td><td className="p-4 text-sm text-gray-600">{projectName(invoice.projectId)}</td><td className="p-4 text-sm font-bold text-gray-900">{invoice.amount}</td><td className="p-4 text-sm text-gray-500">{invoice.dueDate}</td><td className="p-4"><Badge variant={financeStatusVariant[invoice.status]}>{invoice.status}</Badge></td><td className="p-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setDraft(invoice)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Editar cobranca"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: "Pago", receipt: `recibo-${item.id}.pdf` } : item))} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Pago</button><button type="button" onClick={() => setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: "Pendente" } : item))} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">2a via</button><button type="button" onClick={() => setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: "Atrasado" } : item))} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Atrasado</button><button type="button" onClick={() => setInvoices((current) => current.filter((item) => item.id !== invoice.id))} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir cobranca"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Cobranca do cliente">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient={Boolean(forcedClientId)} requireProject={false} onClientChange={(clientId) => setDraft({ ...draft, clientId, projectId: firstProjectIdForClient(clientId) })} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} /><label className="grid gap-2 text-sm font-semibold text-gray-700">Descricao<input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className={inputClassName} /></label><label className="grid gap-2 text-sm font-semibold text-gray-700">Valor<input value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} className={inputClassName} /></label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={saveInvoice}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

function PortalHistory({ forcedClientId }: { forcedClientId?: string }) {
  const [selectedClientId, setSelectedClientId] = useState<ScopedFilter>(forcedClientId ?? "all");
  const [items, setItems] = useState<PortalClientHistoryRecord[]>([...PORTAL_HISTORY_SCOPED]);
  const [draft, setDraft] = useState<PortalClientHistoryRecord | null>(null);
  const [filter, setFilter] = useState("Todos");
  const filteredItems = items.filter((item) => isVisibleByClient(item, selectedClientId) && (filter === "Todos" || item.module === filter));
  const filters = ["Todos", ...Array.from(new Set(items.map((item) => item.module)))];

  function openCreate() {
    if (selectedClientId === "all") return;
    setDraft({ id: `history-local-${Date.now()}`, clientId: selectedClientId, projectId: firstProjectIdForClient(selectedClientId), type: "Nota", action: "Registro manual", description: `Nota criada para ${clientName(selectedClientId)}.`, createdBy: "Ateliux", date: "Agora", module: "Historico" });
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Historico" description="Historico sempre filtrado por cliente e modulo relacionado." action={<AdminButton onClick={openCreate}><Plus className="h-4 w-4" /> Nova nota</AdminButton>} />
      <AdminClientFilter clients={PORTAL_CLIENTS} selectedClientId={selectedClientId} onChange={setSelectedClientId} locked={Boolean(forcedClientId)} allowAll={!forcedClientId} />
      <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${filter === item ? "bg-[#00B074] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>{item}</button>)}</div>
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><div className="space-y-5">{filteredItems.map((item) => <div key={item.id} className="flex gap-4"><div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#00B074]" /><div className="flex-1 rounded-2xl bg-gray-50 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h3 className="font-bold text-gray-900">{item.action}</h3><span className="text-xs text-gray-400">{item.date}</span></div><p className="mt-1 text-sm text-gray-500">{item.description}</p><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-gray-400">{clientName(item.clientId)} - {projectName(item.projectId)} - {item.module}</p><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="text-xs font-semibold text-red-500 hover:text-red-600">Excluir</button></div></div></div>)}</div></div>
      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Nova nota historica">{draft ? <div className="grid gap-4"><ClientProjectFields selectedClientId={draft.clientId} projectId={draft.projectId} lockedClient onClientChange={() => undefined} onProjectChange={(projectId) => setDraft({ ...draft, projectId })} requireProject={false} /><label className="grid gap-2 text-sm font-semibold text-gray-700">Descricao<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} className={`${inputClassName} resize-none`} /></label><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDraft(null)}>Cancelar</AdminButton><AdminButton onClick={() => { setItems((current) => [draft, ...current]); setDraft(null); }}>Salvar</AdminButton></div></div> : null}</Modal>
    </div>
  );
}

export function PortalManagementView({ section = "clients", clientId }: PortalManagementViewProps) {
  switch (section) {
    case "workspace":
      return <ClientWorkspace clientId={clientId ?? ""} />;
    case "projects":
      return <PortalProjects />;
    case "briefings":
      return <PortalBriefings />;
    case "stages":
      return <PortalStages />;
    case "approvals":
      return <PortalApprovals />;
    case "requests":
      return <PortalRequests />;
    case "files":
      return <PortalFiles />;
    case "previews":
      return <PortalPreviews />;
    case "schedule":
      return <PortalSchedule />;
    case "billing":
      return <PortalBilling />;
    case "history":
      return <PortalHistory />;
    default:
      return <PortalClients />;
  }
}
