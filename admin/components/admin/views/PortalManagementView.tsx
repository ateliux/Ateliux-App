"use client";

import Link from "next/link";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  FolderKanban,
  History,
  Link2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UploadCloud,
  UserCheck,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { adminPortalApi } from "@/services/admin-portal-modules.service";
import { listAdminClients } from "@/services/admin-clients.service";
import {
  createAdminFileAsset,
  approveAdminFile,
  deleteAdminFile,
  listAdminFiles,
  rejectAdminFile,
  type AdminFileAsset,
} from "@/services/admin-files.service";
import { createAdminProject, deleteAdminProject, listAdminClientProjects, updateAdminProject } from "@/services/admin-projects.service";
import {
  convertAdminRequestToStage,
  createAdminClientRequest,
  listAdminClientRequests,
  replyAdminClientRequest,
  updateAdminClientRequest,
  type AdminClientRequestDto,
} from "@/services/admin-requests.service";
import type { AdminClient, BadgeVariant } from "@/types/admin";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Badge } from "@/components/admin/ui/Badge";

type PortalSection = "clients" | "workspace" | "projects" | "briefings" | "stages" | "approvals" | "requests" | "files" | "previews" | "schedule" | "billing" | "history";

type PortalManagementViewProps = {
  section?: PortalSection;
  clientId?: string;
};

type ApiRecord = Record<string, unknown>;

type PortalData = {
  clients: AdminClient[];
  projects: ApiRecord[];
  briefings: ApiRecord[];
  stages: ApiRecord[];
  approvals: ApiRecord[];
  requests: AdminClientRequestDto[];
  files: AdminFileAsset[];
  previews: ApiRecord[];
  schedule: ApiRecord[];
  billing: ApiRecord[];
  history: ApiRecord[];
  fileSource: "api" | "mock";
};

type DraftState = {
  title: string;
  description: string;
  url: string;
  amount: string;
  date: string;
};

const emptyData: PortalData = {
  clients: [],
  projects: [],
  briefings: [],
  stages: [],
  approvals: [],
  requests: [],
  files: [],
  previews: [],
  schedule: [],
  billing: [],
  history: [],
  fileSource: "api",
};

const emptyDraft: DraftState = {
  title: "",
  description: "",
  url: "",
  amount: "",
  date: "",
};

const tabs: readonly { id: Exclude<PortalSection, "workspace">; label: string; href: string }[] = [
  { id: "clients", label: "Clientes", href: "/portal-do-cliente/clientes" },
  { id: "projects", label: "Projetos", href: "/portal-do-cliente/projetos" },
  { id: "briefings", label: "Briefings", href: "/portal-do-cliente/briefings" },
  { id: "stages", label: "Etapas", href: "/portal-do-cliente/etapas" },
  { id: "approvals", label: "Aprovacoes", href: "/portal-do-cliente/aprovacoes" },
  { id: "requests", label: "Solicitacoes", href: "/portal-do-cliente/solicitacoes" },
  { id: "files", label: "Arquivos", href: "/portal-do-cliente/arquivos" },
  { id: "previews", label: "Previews", href: "/portal-do-cliente/previews" },
  { id: "schedule", label: "Cronograma", href: "/portal-do-cliente/cronograma" },
  { id: "billing", label: "Financeiro", href: "/portal-do-cliente/financeiro" },
  { id: "history", label: "Historico", href: "/portal-do-cliente/historico" },
];

const sectionMeta: Record<Exclude<PortalSection, "workspace">, { title: string; description: string; icon: ReactNode; actionLabel: string }> = {
  clients: {
    title: "Clientes do Portal",
    description: "Visao real dos clientes e workspaces vinculados ao Portal do Cliente.",
    icon: <UserCheck className="h-5 w-5" />,
    actionLabel: "",
  },
  projects: {
    title: "Projetos",
    description: "Projetos criados no admin e publicados por cliente.",
    icon: <FolderKanban className="h-5 w-5" />,
    actionLabel: "Novo projeto",
  },
  briefings: {
    title: "Briefings",
    description: "Briefings enviados ou mantidos internamente para cada cliente.",
    icon: <FileText className="h-5 w-5" />,
    actionLabel: "Novo briefing",
  },
  stages: {
    title: "Etapas",
    description: "Etapas operacionais vinculadas ao projeto e ao cliente.",
    icon: <Workflow className="h-5 w-5" />,
    actionLabel: "Nova etapa",
  },
  approvals: {
    title: "Aprovacoes",
    description: "Entregas aguardando aprovacao, reenvio ou ajuste do cliente.",
    icon: <CheckCircle2 className="h-5 w-5" />,
    actionLabel: "Nova aprovacao",
  },
  requests: {
    title: "Solicitacoes",
    description: "Solicitacoes reais feitas pelo cliente ou criadas pela equipe.",
    icon: <MessageSquare className="h-5 w-5" />,
    actionLabel: "Nova solicitacao",
  },
  files: {
    title: "Arquivos",
    description: "Metadados de arquivos, anexos e documentos visiveis ao cliente.",
    icon: <UploadCloud className="h-5 w-5" />,
    actionLabel: "Novo arquivo",
  },
  previews: {
    title: "Previews",
    description: "Links de previa enviados ao cliente e conectados a aprovacao.",
    icon: <Link2 className="h-5 w-5" />,
    actionLabel: "Novo preview",
  },
  schedule: {
    title: "Cronograma",
    description: "Eventos internos ou visiveis no Portal do Cliente.",
    icon: <CalendarDays className="h-5 w-5" />,
    actionLabel: "Novo evento",
  },
  billing: {
    title: "Financeiro",
    description: "Cobrancas, parcelas e status financeiro por cliente.",
    icon: <CreditCard className="h-5 w-5" />,
    actionLabel: "Nova cobranca",
  },
  history: {
    title: "Historico",
    description: "Historico auditavel e notas manuais do relacionamento.",
    icon: <History className="h-5 w-5" />,
    actionLabel: "Nova nota",
  },
};

const inputClassName = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#00B074]/20";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatDate(value: unknown, fallback = "Nao informado") {
  const raw = typeof value === "string" || value instanceof Date ? value : "";
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("pt-BR").format(date) : fallback;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "arquivo";
}

function normalizeStatus(status: unknown) {
  return asString(status, "Sem status").replace(/_/g, " ");
}

function badgeVariant(status: unknown): BadgeVariant {
  const value = asString(status).toUpperCase();
  if (["ACTIVE", "APPROVED", "COMPLETED", "PAID", "VISIBLE_TO_CLIENT", "CLIENT_VISIBLE"].some((item) => value.includes(item))) return "green";
  if (["WAITING", "PENDING", "NEW", "SENT", "IN_REVIEW", "IN_PROGRESS", "DRAFT"].some((item) => value.includes(item))) return "yellow";
  if (["REJECT", "OVERDUE", "CHANGES", "CANCELLED", "ARCHIVED", "SUSPENDED"].some((item) => value.includes(item))) return "red";
  return "gray";
}

function clientIdOf(item: ApiRecord | AdminFileAsset | AdminClientRequestDto) {
  if ("clientId" in item && typeof item.clientId === "string") return item.clientId;
  const client = "client" in item && item.client && typeof item.client === "object" ? item.client as ApiRecord : null;
  return asString(client?.id);
}

function projectIdOf(item: ApiRecord | AdminFileAsset | AdminClientRequestDto) {
  if ("projectId" in item && typeof item.projectId === "string") return item.projectId;
  const project = "project" in item && item.project && typeof item.project === "object" ? item.project as ApiRecord : null;
  return asString(project?.id);
}

function projectClientId(project: ApiRecord) {
  const client = typeof project.client === "object" && project.client ? project.client as ApiRecord : null;
  return asString(project.clientId, asString(client?.id));
}

function itemTitle(section: PortalSection, item: ApiRecord | AdminFileAsset | AdminClientRequestDto) {
  if (section === "files") return asString((item as AdminFileAsset).originalName ?? (item as ApiRecord).name, "Arquivo");
  if (section === "billing") return asString((item as ApiRecord).description, "Cobranca");
  if (section === "history") {
    const metadata = typeof (item as ApiRecord).metadata === "object" && (item as ApiRecord).metadata ? (item as ApiRecord).metadata as ApiRecord : {};
    return asString(metadata.title, asString((item as ApiRecord).action, "Registro"));
  }
  return asString((item as ApiRecord).title ?? (item as ApiRecord).name, "Registro");
}

function itemDescription(section: PortalSection, item: ApiRecord | AdminFileAsset | AdminClientRequestDto) {
  if (section === "files") {
    const file = item as AdminFileAsset;
    return `${asString(file.mimeType, "Arquivo")} - ${Math.round(asNumber(file.size) / 1024)} KB`;
  }
  if (section === "billing") return `Valor: R$ ${asNumber((item as ApiRecord).amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  if (section === "history") {
    const metadata = typeof (item as ApiRecord).metadata === "object" && (item as ApiRecord).metadata ? (item as ApiRecord).metadata as ApiRecord : {};
    return asString(metadata.description, asString((item as ApiRecord).entityType, "Historico"));
  }
  return asString((item as ApiRecord).description ?? (item as AdminClientRequestDto).response ?? (item as ApiRecord).message, "Sem descricao publicada.");
}

function itemStatus(section: PortalSection, item: ApiRecord | AdminFileAsset | AdminClientRequestDto) {
  if (section === "files" && "status" in item) return item.status;
  if (section === "history") return asString((item as ApiRecord).entityType, "AUDIT");
  return (item as ApiRecord).status ?? "Sem status";
}

function itemDate(section: PortalSection, item: ApiRecord | AdminFileAsset | AdminClientRequestDto) {
  if (section === "schedule") return formatDate((item as ApiRecord).date);
  if (section === "billing") return formatDate((item as ApiRecord).dueDate);
  return formatDate((item as ApiRecord).updatedAt ?? (item as ApiRecord).createdAt);
}

function visibleForClient<T extends ApiRecord | AdminFileAsset | AdminClientRequestDto>(items: T[], selectedClientId: string) {
  if (selectedClientId === "all") return items;
  return items.filter((item) => clientIdOf(item) === selectedClientId || (selectedClientId && projectClientId(item as ApiRecord) === selectedClientId));
}

function SectionTitle({ section, action }: { section: Exclude<PortalSection, "workspace">; action?: ReactNode }) {
  const meta = sectionMeta[section];
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6F7F1] text-[#00B074]">{meta.icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{meta.title}</h2>
          <p className="text-sm text-gray-500">{meta.description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  );
}

function ClientFilter({
  clients,
  selectedClientId,
  locked,
  onChange,
}: {
  clients: AdminClient[];
  selectedClientId: string;
  locked: boolean;
  onChange: (clientId: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-gray-700">
      Cliente
      <select value={selectedClientId} disabled={locked} onChange={(event) => onChange(event.target.value)} className={inputClassName}>
        {!locked ? <option value="all">Todos os clientes</option> : null}
        {clients.map((client) => <option key={client.id} value={String(client.id)}>{client.company}</option>)}
      </select>
    </label>
  );
}

function ProjectSelect({
  projects,
  selectedClientId,
  value,
  onChange,
}: {
  projects: ApiRecord[];
  selectedClientId: string;
  value: string;
  onChange: (projectId: string) => void;
}) {
  const filteredProjects = projects.filter((project) => selectedClientId === "all" || projectClientId(project) === selectedClientId);
  return (
    <label className="grid gap-2 text-sm font-semibold text-gray-700">
      Projeto
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName}>
        <option value="">Sem projeto</option>
        {filteredProjects.map((project) => <option key={asString(project.id)} value={asString(project.id)}>{asString(project.name, "Projeto")}</option>)}
      </select>
    </label>
  );
}

function CreatePanel({
  section,
  clients,
  projects,
  selectedClientId,
  selectedProjectId,
  draft,
  saving,
  onClientChange,
  onProjectChange,
  onDraftChange,
  onSubmit,
  lockedClient,
}: {
  section: Exclude<PortalSection, "clients" | "workspace">;
  clients: AdminClient[];
  projects: ApiRecord[];
  selectedClientId: string;
  selectedProjectId: string;
  draft: DraftState;
  saving: boolean;
  onClientChange: (clientId: string) => void;
  onProjectChange: (projectId: string) => void;
  onDraftChange: (draft: DraftState) => void;
  onSubmit: () => void;
  lockedClient: boolean;
}) {
  const needsUrl = section === "previews";
  const needsAmount = section === "billing";
  const needsDate = section === "schedule" || section === "billing";
  const titleLabel = section === "billing" ? "Descricao da cobranca" : section === "files" ? "Nome do arquivo" : "Titulo";

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2">
        <h3 className="font-bold text-gray-900">{sectionMeta[section].actionLabel}</h3>
        <p className="text-sm text-gray-500">Cria o registro direto na API e vincula por cliente/projeto.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ClientFilter clients={clients} selectedClientId={selectedClientId} locked={lockedClient} onChange={onClientChange} />
        <ProjectSelect projects={projects} selectedClientId={selectedClientId} value={selectedProjectId} onChange={onProjectChange} />
        <label className="grid gap-2 text-sm font-semibold text-gray-700">
          {titleLabel}
          <input value={draft.title} onChange={(event) => onDraftChange({ ...draft, title: event.target.value })} className={inputClassName} />
        </label>
        {needsUrl ? (
          <label className="grid gap-2 text-sm font-semibold text-gray-700">
            URL do preview
            <input value={draft.url} onChange={(event) => onDraftChange({ ...draft, url: event.target.value })} className={inputClassName} />
          </label>
        ) : null}
        {needsAmount ? (
          <label className="grid gap-2 text-sm font-semibold text-gray-700">
            Valor
            <input value={draft.amount} onChange={(event) => onDraftChange({ ...draft, amount: event.target.value })} className={inputClassName} />
          </label>
        ) : null}
        {needsDate ? (
          <label className="grid gap-2 text-sm font-semibold text-gray-700">
            Data
            <input type="date" value={draft.date} onChange={(event) => onDraftChange({ ...draft, date: event.target.value })} className={inputClassName} />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-semibold text-gray-700 lg:col-span-2">
          Descricao
          <textarea value={draft.description} onChange={(event) => onDraftChange({ ...draft, description: event.target.value })} rows={3} className={`${inputClassName} resize-none`} />
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <AdminButton disabled={saving} onClick={onSubmit}>
          <Plus className="h-4 w-4" />
          {saving ? "Salvando..." : sectionMeta[section].actionLabel}
        </AdminButton>
      </div>
    </div>
  );
}

function RecordsTable({
  section,
  items,
  clients,
  projects,
  busyKey,
  onAction,
}: {
  section: Exclude<PortalSection, "clients" | "workspace">;
  items: Array<ApiRecord | AdminFileAsset | AdminClientRequestDto>;
  clients: AdminClient[];
  projects: ApiRecord[];
  busyKey: string;
  onAction: (action: string, item: ApiRecord | AdminFileAsset | AdminClientRequestDto) => void;
}) {
  const clientName = useCallback((id: string) => clients.find((client) => String(client.id) === id)?.company ?? "Sem cliente", [clients]);
  const projectName = useCallback((id: string) => asString(projects.find((project) => asString(project.id) === id)?.name, "Sem projeto"), [projects]);

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <h3 className="font-bold text-gray-900">Nenhum registro encontrado</h3>
        <p className="mt-2 text-sm text-gray-500">Crie um registro acima ou ajuste o filtro de cliente.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left">
          <thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="rounded-l-xl p-4">Registro</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Projeto</th>
              <th className="p-4">Status</th>
              <th className="p-4">Data</th>
              <th className="rounded-r-xl p-4 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => {
              const id = asString((item as ApiRecord).id);
              const status = itemStatus(section, item);
              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{itemTitle(section, item)}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{itemDescription(section, item)}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{clientName(clientIdOf(item))}</td>
                  <td className="p-4 text-sm text-gray-600">{projectName(projectIdOf(item))}</td>
                  <td className="p-4"><Badge variant={badgeVariant(status)}>{normalizeStatus(status)}</Badge></td>
                  <td className="p-4 text-sm text-gray-500">{itemDate(section, item)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      {section === "projects" ? (
                        <>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:complete`} onClick={() => onAction("complete-project", item)}>Concluir</AdminButton>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:archive`} onClick={() => onAction("archive-project", item)}><Archive className="h-4 w-4" /> Arquivar</AdminButton>
                        </>
                      ) : null}
                      {section === "briefings" ? <AdminButton variant="secondary" disabled={busyKey === `${id}:send`} onClick={() => onAction("send-briefing", item)}><Send className="h-4 w-4" /> Enviar</AdminButton> : null}
                      {section === "stages" ? (
                        <>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:send`} onClick={() => onAction("send-stage", item)}>Publicar</AdminButton>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:approval`} onClick={() => onAction("request-stage-approval", item)}>Aprovar</AdminButton>
                        </>
                      ) : null}
                      {section === "approvals" ? <AdminButton variant="secondary" disabled={busyKey === `${id}:send`} onClick={() => onAction("send-approval", item)}><Send className="h-4 w-4" /> Enviar</AdminButton> : null}
                      {section === "requests" ? (
                        <>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:progress`} onClick={() => onAction("request-progress", item)}>Em execucao</AdminButton>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:reply`} onClick={() => onAction("reply-request", item)}>Responder</AdminButton>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:convert`} onClick={() => onAction("convert-request", item)}>Virar etapa</AdminButton>
                        </>
                      ) : null}
                      {section === "files" ? (
                        <>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:approve`} onClick={() => onAction("approve-file", item)}>Aprovar</AdminButton>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:reject`} onClick={() => onAction("reject-file", item)}>Rejeitar</AdminButton>
                        </>
                      ) : null}
                      {section === "previews" ? <AdminButton variant="secondary" disabled={busyKey === `${id}:approval`} onClick={() => onAction("send-preview-approval", item)}><Send className="h-4 w-4" /> Enviar</AdminButton> : null}
                      {section === "schedule" ? <AdminButton variant="secondary" disabled={busyKey === `${id}:toggle`} onClick={() => onAction("toggle-schedule", item)}>Alternar visibilidade</AdminButton> : null}
                      {section === "billing" ? (
                        <>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:paid`} onClick={() => onAction("mark-paid", item)}>Pago</AdminButton>
                          <AdminButton variant="secondary" disabled={busyKey === `${id}:overdue`} onClick={() => onAction("mark-overdue", item)}>Atrasado</AdminButton>
                        </>
                      ) : null}
                      {section !== "history" ? <AdminButton variant="danger" disabled={busyKey === `${id}:delete`} onClick={() => onAction("delete", item)}><Trash2 className="h-4 w-4" /> Excluir</AdminButton> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientsView({ data, selectedClientId }: { data: PortalData; selectedClientId: string }) {
  const clients = selectedClientId === "all" ? data.clients : data.clients.filter((client) => String(client.id) === selectedClientId);
  const activeProjects = visibleForClient(data.projects, selectedClientId);
  const pendingApprovals = visibleForClient(data.approvals, selectedClientId).filter((item) => ["WAITING_CLIENT", "SENT", "RESENT"].includes(asString(item.status))).length;
  const openRequests = visibleForClient(data.requests, selectedClientId).filter((item) => !["COMPLETED", "ARCHIVED"].includes(item.status)).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Clientes" value={clients.length} />
        <StatCard label="Projetos" value={activeProjects.length} />
        <StatCard label="Aprovacoes pendentes" value={pendingApprovals} />
        <StatCard label="Solicitacoes abertas" value={openRequests} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {clients.map((client) => {
          const projects = data.projects.filter((project) => projectClientId(project) === String(client.id));
          const approvals = data.approvals.filter((approval) => clientIdOf(approval) === String(client.id));
          const requests = data.requests.filter((request) => clientIdOf(request) === String(client.id));
          return (
            <div key={client.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant={client.accountStatus === "Ativa" ? "green" : client.accountStatus === "Inativa" ? "gray" : "yellow"}>{client.accountStatus}</Badge>
                    <Badge variant="gray">{client.plan}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{client.company}</h3>
                  <p className="text-sm text-gray-500">{client.name} - {client.email}</p>
                </div>
                <Link href={`/portal-do-cliente/clientes/${client.id}`} className="inline-flex items-center justify-center rounded-xl bg-[#00B074] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#009662]">
                  Gerenciar portal
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Projetos</p><p className="font-bold text-gray-900">{projects.length}</p></div>
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Aprovacoes</p><p className="font-bold text-gray-900">{approvals.length}</p></div>
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Solicitacoes</p><p className="font-bold text-gray-900">{requests.length}</p></div>
                <div className="rounded-2xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Responsavel</p><p className="font-bold text-gray-900">{client.responsible}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PortalManagementView({ section = "clients", clientId }: PortalManagementViewProps) {
  const initialSection = section === "workspace" ? "clients" : section;
  const lockedClient = Boolean(clientId);
  const [activeSection, setActiveSection] = useState<Exclude<PortalSection, "workspace">>(initialSection);
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? "all");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [data, setData] = useState<PortalData>(emptyData);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const clients = await listAdminClients();
      const [
        projectGroups,
        briefings,
        stages,
        approvals,
        requests,
        filesResult,
        previews,
        schedule,
        billing,
        history,
      ] = await Promise.all([
        Promise.all(clients.map((client) => listAdminClientProjects<ApiRecord>(String(client.id)).catch(() => []))),
        adminPortalApi.briefings.list<ApiRecord>(),
        adminPortalApi.stages.list<ApiRecord>(),
        adminPortalApi.approvals.list<ApiRecord>(),
        listAdminClientRequests(),
        listAdminFiles(),
        adminPortalApi.previews.list<ApiRecord>(),
        adminPortalApi.schedule.list<ApiRecord>(),
        adminPortalApi.finance.list<ApiRecord>(),
        adminPortalApi.history.list<ApiRecord>(),
      ]);

      const projects = projectGroups.flat();
      const firstClientId = selectedClientId === "all" ? clients[0]?.id : selectedClientId;
      const firstProject = projects.find((project) => !firstClientId || projectClientId(project) === String(firstClientId)) ?? projects[0];
      setData({
        clients,
        projects,
        briefings,
        stages,
        approvals,
        requests,
        files: filesResult.files,
        previews,
        schedule,
        billing,
        history,
        fileSource: filesResult.source,
      });
      setSelectedProjectId((current) => current || asString(firstProject?.id));
    } catch (loadError) {
      if (canUseDevFallback("admin/portal-management")) {
        setData(emptyData);
        setNotice("Fallback de desenvolvimento ativo, mas esta tela exige backend para acoes reais.");
      }
      setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o Portal do Cliente.");
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const visibleItems = useMemo(() => {
    const itemsBySection: Record<Exclude<PortalSection, "clients" | "workspace">, Array<ApiRecord | AdminFileAsset | AdminClientRequestDto>> = {
      projects: data.projects,
      briefings: data.briefings,
      stages: data.stages,
      approvals: data.approvals,
      requests: data.requests,
      files: data.files,
      previews: data.previews,
      schedule: data.schedule,
      billing: data.billing,
      history: data.history,
    };
    if (activeSection === "clients") return [];
    return visibleForClient(itemsBySection[activeSection], selectedClientId);
  }, [activeSection, data, selectedClientId]);

  function handleClientChange(nextClientId: string) {
    setSelectedClientId(nextClientId);
    const firstProject = data.projects.find((project) => nextClientId !== "all" && projectClientId(project) === nextClientId);
    setSelectedProjectId(asString(firstProject?.id));
  }

  async function createRecord() {
    if (activeSection === "clients") return;
    if (selectedClientId === "all") {
      setNotice("Selecione um cliente especifico antes de criar registro.");
      return;
    }

    const title = draft.title.trim() || sectionMeta[activeSection].actionLabel;
    const description = draft.description.trim() || "Registro criado pela administracao Ateliux.";
    setSaving(true);
    setNotice("");
    try {
      if (activeSection === "projects") {
        await createAdminProject({
          clientId: selectedClientId,
          name: title,
          type: "Projeto digital",
          scope: description,
          status: "ACTIVE",
          progress: 0,
          visibleToClient: true,
        });
      }
      if (activeSection === "briefings") {
        await adminPortalApi.briefings.create({ clientId: selectedClientId, projectId: selectedProjectId || undefined, title, type: "Briefing", description, status: "DRAFT", visibility: "INTERNAL" });
      }
      if (activeSection === "stages") {
        await adminPortalApi.stages.create({ clientId: selectedClientId, projectId: selectedProjectId, title, description, status: "IN_PROGRESS", order: data.stages.length + 1, requiresApproval: false });
      }
      if (activeSection === "approvals") {
        await adminPortalApi.approvals.create({ clientId: selectedClientId, projectId: selectedProjectId || undefined, title, type: "Entrega", message: description, status: "DRAFT" });
      }
      if (activeSection === "requests") {
        await createAdminClientRequest({ clientId: selectedClientId, projectId: selectedProjectId || undefined, title, description, category: "admin", priority: "MEDIUM" });
      }
      if (activeSection === "files") {
        const safeName = slugify(title);
        await createAdminFileAsset({
          clientId: selectedClientId,
          projectId: selectedProjectId || undefined,
          name: title,
          originalName: title,
          extension: ".txt",
          mimeType: "text/plain",
          size: 0,
          storageProvider: "manual",
          storageKey: `manual/${Date.now()}-${safeName}.txt`,
          url: `https://files.ateliux.local/${safeName}.txt`,
          origin: "ATELIUX",
          uploadedByType: "ADMIN",
          context: "CLIENT_FILE",
          visibility: "CLIENT_VISIBLE",
          status: "APPROVED",
        });
      }
      if (activeSection === "previews") {
        await adminPortalApi.previews.create({ clientId: selectedClientId, projectId: selectedProjectId || undefined, title, url: draft.url.trim() || "https://preview.ateliux.dev", version: "v1", status: "DRAFT" });
      }
      if (activeSection === "schedule") {
        await adminPortalApi.schedule.create({ clientId: selectedClientId, projectId: selectedProjectId || undefined, title, type: "Entrega", date: draft.date || todayIsoDate(), time: "10:00", notes: description, visibility: "VISIBLE_TO_CLIENT" });
      }
      if (activeSection === "billing") {
        await adminPortalApi.finance.create({ clientId: selectedClientId, projectId: selectedProjectId || undefined, description: title, amount: asNumber(draft.amount, 0), dueDate: draft.date || todayIsoDate(), status: "PENDING", installment: "1/1", visibleToClient: true });
      }
      if (activeSection === "history") {
        await adminPortalApi.history.createManualNote({ clientId: selectedClientId, projectId: selectedProjectId || undefined, title, description });
      }

      setDraft(emptyDraft);
      setNotice("Registro salvo na API.");
      await loadData();
    } catch (createError) {
      setNotice(createError instanceof Error ? createError.message : "Nao foi possivel salvar o registro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(action: string, item: ApiRecord | AdminFileAsset | AdminClientRequestDto) {
    const id = asString((item as ApiRecord).id);
    if (!id) return;
    setBusyKey(`${id}:${action.replace(/^.*-/, "")}`);
    setNotice("");
    try {
      if (action === "complete-project") await updateAdminProject(id, { status: "COMPLETED", progress: 100 });
      if (action === "archive-project") await updateAdminProject(id, { status: "ARCHIVED" });
      if (action === "send-briefing") await adminPortalApi.briefings.send(id);
      if (action === "send-stage") await adminPortalApi.stages.sendToClient(id);
      if (action === "request-stage-approval") await adminPortalApi.stages.requestApproval(id);
      if (action === "send-approval") await adminPortalApi.approvals.send(id);
      if (action === "request-progress") await updateAdminClientRequest(id, { status: "IN_PROGRESS" });
      if (action === "reply-request") await replyAdminClientRequest(id, "Resposta registrada pela equipe Ateliux no admin.");
      if (action === "convert-request") await convertAdminRequestToStage(id);
      if (action === "approve-file") await approveAdminFile(id);
      if (action === "reject-file") await rejectAdminFile(id, "Rejeitado pela administracao Ateliux.");
      if (action === "send-preview-approval") await adminPortalApi.previews.sendForApproval(id);
      if (action === "toggle-schedule") {
        const currentVisibility = asString((item as ApiRecord).visibility);
        await adminPortalApi.schedule.update(id, { visibility: currentVisibility === "VISIBLE_TO_CLIENT" ? "INTERNAL" : "VISIBLE_TO_CLIENT" });
      }
      if (action === "mark-paid") await adminPortalApi.finance.update(id, { status: "PAID" });
      if (action === "mark-overdue") await adminPortalApi.finance.update(id, { status: "OVERDUE" });
      if (action === "delete") {
        if (activeSection === "projects") await deleteAdminProject(id);
        if (activeSection === "briefings") await adminPortalApi.briefings.delete(id);
        if (activeSection === "stages") await adminPortalApi.stages.delete(id);
        if (activeSection === "approvals") await adminPortalApi.approvals.delete(id);
        if (activeSection === "files") await deleteAdminFile(id);
        if (activeSection === "previews") await adminPortalApi.previews.delete(id);
        if (activeSection === "schedule") await adminPortalApi.schedule.delete(id);
        if (activeSection === "billing") await adminPortalApi.finance.delete(id);
      }
      setNotice("Acao aplicada na API.");
      await loadData();
    } catch (actionError) {
      setNotice(actionError instanceof Error ? actionError.message : "Nao foi possivel executar a acao.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        section={activeSection}
        action={
          <AdminButton variant="secondary" onClick={loadData} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </AdminButton>
        }
      />

      <div className="flex gap-2 overflow-x-auto rounded-3xl border border-gray-100 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${activeSection === tab.id ? "bg-[#00B074] text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ClientFilter clients={data.clients} selectedClientId={selectedClientId} locked={lockedClient} onChange={handleClientChange} />
        <ProjectSelect projects={data.projects} selectedClientId={selectedClientId} value={selectedProjectId} onChange={setSelectedProjectId} />
      </div>

      {section === "workspace" && clientId ? (
        <div className="rounded-2xl border border-[#A7F3D0] bg-[#E6F7F1] px-4 py-3 text-sm font-semibold text-[#00B074]">
          Workspace isolado do cliente selecionado. Todas as criacoes desta tela ficam vinculadas a esse cliente.
        </div>
      ) : null}
      {data.fileSource === "mock" ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Arquivos usando fallback de desenvolvimento. Em producao esse fallback e bloqueado.
        </div>
      ) : null}
      {notice ? <div className="rounded-2xl border border-[#A7F3D0] bg-[#E6F7F1] px-4 py-3 text-sm font-semibold text-[#00B074]">{notice}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div> : null}

      {loading ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <Clock className="mx-auto h-6 w-6 animate-spin text-[#00B074]" />
          <p className="mt-3 text-sm font-semibold text-gray-600">Carregando dados reais do Portal do Cliente...</p>
        </div>
      ) : activeSection === "clients" ? (
        <ClientsView data={data} selectedClientId={selectedClientId} />
      ) : (
        <div className="space-y-6">
          <CreatePanel
            section={activeSection}
            clients={data.clients}
            projects={data.projects}
            selectedClientId={selectedClientId}
            selectedProjectId={selectedProjectId}
            draft={draft}
            saving={saving}
            lockedClient={lockedClient}
            onClientChange={handleClientChange}
            onProjectChange={setSelectedProjectId}
            onDraftChange={setDraft}
            onSubmit={createRecord}
          />
          <RecordsTable
            section={activeSection}
            items={visibleItems}
            clients={data.clients}
            projects={data.projects}
            busyKey={busyKey}
            onAction={handleAction}
          />
        </div>
      )}
    </div>
  );
}
