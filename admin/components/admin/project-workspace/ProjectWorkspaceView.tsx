"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, RefreshCw, Send, UploadCloud } from "lucide-react";
import { adminPortalApi } from "@/services/admin-portal-modules.service";
import { approveAdminFile, deleteAdminFile, getAdminFileSignedUrl, rejectAdminFile, uploadAdminPortalFile } from "@/services/admin-files.service";
import { listAdminUsers, updateAdminProject, type AdminUserOption } from "@/services/admin-projects.service";
import {
  getAdminProjectWorkspace,
  type AdminProjectWorkspace,
  type AdminProjectWorkspaceItem,
} from "@/services/admin-project-workspace.service";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { LoadingState } from "@/components/admin/ui/LoadingState";
import type { BadgeVariant } from "@/types/admin";

type ProjectWorkspaceViewProps = {
  projectId: string;
};

type WorkspaceTab =
  | "overview"
  | "client"
  | "team"
  | "scope"
  | "stages"
  | "briefings"
  | "files"
  | "approvals"
  | "previews"
  | "schedule"
  | "finance"
  | "history"
  | "portal";

type PortalUploadContext = "client_file" | "approval_attachment" | "briefing_attachment" | "finance_receipt" | "preview_asset";

const tabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "overview", label: "Visao geral" },
  { id: "client", label: "Cliente" },
  { id: "team", label: "Equipe" },
  { id: "scope", label: "Escopo" },
  { id: "stages", label: "Etapas" },
  { id: "briefings", label: "Briefing" },
  { id: "files", label: "Arquivos" },
  { id: "approvals", label: "Aprovacoes" },
  { id: "previews", label: "Preview" },
  { id: "schedule", label: "Cronograma" },
  { id: "finance", label: "Financeiro" },
  { id: "history", label: "Historico" },
  { id: "portal", label: "Configuracoes do Portal" },
];

const inputClassName = "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#00B074] focus:ring-4 focus:ring-emerald-50";
const textareaClassName = `${inputClassName} min-h-28 resize-y`;

export function ProjectWorkspaceView({ projectId }: ProjectWorkspaceViewProps) {
  const [data, setData] = useState<AdminProjectWorkspace | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserOption[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [workspace, users] = await Promise.all([
        getAdminProjectWorkspace(projectId),
        listAdminUsers(),
      ]);
      setData(workspace);
      setAdminUsers(users);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar o projeto.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const teamIds = useMemo(() => data?.team.filter((member) => !member.primary).map((member) => member.id) ?? [], [data]);

  async function execute(action: () => Promise<unknown>, successMessage: string) {
    setSaving(true);
    setNotice("");
    try {
      await action();
      setNotice(successMessage);
      await loadData();
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : "Nao foi possivel concluir a acao.");
    } finally {
      setSaving(false);
    }
  }

  function handleScopeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => updateAdminProject(data.project.id, {
        type: formText(formData, "type"),
        scope: formText(formData, "scope"),
        description: formText(formData, "description") || undefined,
        clientFacingSummary: formText(formData, "clientFacingSummary") || undefined,
        internalNotes: formText(formData, "internalNotes") || undefined,
      }),
      "Escopo do projeto atualizado.",
    );
  }

  function handleTeamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    const nextTeamIds = formData.getAll("teamIds").filter((value): value is string => typeof value === "string");
    void execute(
      () => updateAdminProject(data.project.id, {
        managerId: formText(formData, "managerId"),
        teamIds: nextTeamIds,
      }),
      "Equipe do projeto atualizada.",
    );
  }

  function handlePortalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => updateAdminProject(data.project.id, {
        visibleToClient: formData.get("visibleToClient") === "on",
        status: formText(formData, "status"),
        currentStage: formText(formData, "currentStage"),
        progress: formNumber(formData, "progress"),
        deadline: formText(formData, "deadline"),
        clientFacingSummary: formText(formData, "clientFacingSummary") || data.project.scope,
      }),
      "Configuracoes do Portal atualizadas.",
    );
  }

  function handleCreateStage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => adminPortalApi.stages.create({
        clientId: data.client.id,
        projectId: data.project.id,
        title: formText(formData, "title"),
        description: formText(formData, "description"),
        status: formText(formData, "status") || "IN_PROGRESS",
        order: data.stages.length + 1,
        requiresApproval: formData.get("requiresApproval") === "on",
      }),
      "Etapa criada para este projeto.",
    );
  }

  function handleCreateBriefing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => adminPortalApi.briefings.create({
        clientId: data.client.id,
        projectId: data.project.id,
        title: formText(formData, "title"),
        type: formText(formData, "type") || "Briefing",
        description: formText(formData, "description"),
        status: formText(formData, "status") || "DRAFT",
        visibility: formText(formData, "visibility") || "INTERNAL",
      }),
      "Briefing criado para este projeto.",
    );
  }

  function handleCreateApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => adminPortalApi.approvals.create({
        clientId: data.client.id,
        projectId: data.project.id,
        title: formText(formData, "title"),
        type: formText(formData, "type") || "Entrega",
        message: formText(formData, "message"),
        status: formText(formData, "status") || "DRAFT",
      }),
      "Aprovacao criada para este projeto.",
    );
  }

  function handleCreatePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => adminPortalApi.previews.create({
        clientId: data.client.id,
        projectId: data.project.id,
        title: formText(formData, "title"),
        url: formText(formData, "url"),
        version: formText(formData, "version") || "v1",
        status: formText(formData, "status") || "DRAFT",
      }),
      "Preview criado para este projeto.",
    );
  }

  function handleCreateSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => adminPortalApi.schedule.create({
        clientId: data.client.id,
        projectId: data.project.id,
        title: formText(formData, "title"),
        type: formText(formData, "type") || "Entrega",
        date: formText(formData, "date"),
        time: formText(formData, "time") || undefined,
        responsible: formText(formData, "responsible") || undefined,
        notes: formText(formData, "notes") || undefined,
        visibility: formText(formData, "visibility") || "VISIBLE_TO_CLIENT",
      }),
      "Evento criado no cronograma.",
    );
  }

  function handleCreateFinance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => adminPortalApi.finance.create({
        clientId: data.client.id,
        projectId: data.project.id,
        description: formText(formData, "description"),
        amount: formNumber(formData, "amount"),
        dueDate: formText(formData, "dueDate"),
        status: formText(formData, "status") || "PENDING",
        installment: formText(formData, "installment") || undefined,
        visibleToClient: formData.get("visibleToClient") === "on",
      }),
      "Registro financeiro criado.",
    );
  }

  function handleCreateHistory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    void execute(
      () => adminPortalApi.history.createManualNote({
        clientId: data.client.id,
        projectId: data.project.id,
        title: formText(formData, "title") || "Nota manual",
        description: formText(formData, "description"),
      }),
      "Nota adicionada ao historico.",
    );
  }

  function handleUploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setNotice("Selecione um arquivo antes de enviar.");
      return;
    }
    void execute(
      () => uploadAdminPortalFile(file, {
        clientId: data.client.id,
        projectId: data.project.id,
        context: formText(formData, "context") as PortalUploadContext,
      }),
      "Arquivo enviado para revisao.",
    );
  }

  function handleDownloadFile(fileId: string) {
    void execute(async () => {
      const signed = await getAdminFileSignedUrl(fileId);
      window.open(signed.url, "_blank", "noopener,noreferrer");
    }, "URL segura do arquivo gerada.");
  }

  if (loading) {
    return <LoadingState title="Carregando workspace do projeto" description="Buscando dados consolidados do backend." />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Nao foi possivel abrir o projeto."
        description={error || "Projeto nao encontrado ou sem permissao."}
        onRetry={() => void loadData()}
      />
    );
  }

  const { project, client, permissions } = data;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/portal-do-cliente/projetos" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Voltar para projetos
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-950">{project.name}</h1>
              <Badge variant={badgeVariant(project.status)}>{normalizeStatus(project.status)}</Badge>
              <Badge variant={project.visibleToClient ? "green" : "gray"}>{project.visibleToClient ? "Publicado no Portal" : "Interno"}</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{project.clientFacingSummary || project.description || project.scope}</p>
          </div>
          <AdminButton variant="secondary" onClick={() => void loadData()} disabled={saving}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </AdminButton>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <InfoTile label="Cliente" value={client.company || client.name} />
          <InfoTile label="Responsavel" value={data.team.find((member) => member.primary)?.name ?? "Sem responsavel"} />
          <InfoTile label="Etapa atual" value={project.currentStage || "Nao definida"} />
          <InfoTile label="Prazo" value={formatDate(project.deadline)} />
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Progresso</span>
            <span>{project.progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-[#00B074]" style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} />
          </div>
        </div>
      </div>

      {notice ? <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">{notice}</div> : null}

      <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-gray-950 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? renderOverview(data) : null}
      {activeTab === "client" ? renderClient(data) : null}
      {activeTab === "team" ? (
        <SectionCard title="Equipe do projeto" description="Responsavel principal e equipe de execucao vinculada ao projeto.">
          <ReadonlyTeam data={data} />
          {permissions.canManageTeam ? (
            <form onSubmit={handleTeamSubmit} className="mt-6 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Responsavel principal
                <select name="managerId" defaultValue={project.managerId ?? ""} className={inputClassName} required>
                  <option value="">Selecione</option>
                  {adminUsers.map((user) => (
                    <option key={user.id} value={user.id}>{user.user.name} - {normalizeStatus(user.role)}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3">
                <p className="text-sm font-semibold text-gray-700">Equipe auxiliar</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {adminUsers.map((user) => (
                    <label key={user.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600">
                      <input name="teamIds" type="checkbox" value={user.id} defaultChecked={teamIds.includes(user.id)} className="h-4 w-4 accent-[#00B074]" />
                      <span>{user.user.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{normalizeStatus(user.role)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <AdminButton type="submit" disabled={saving}>Salvar equipe</AdminButton>
            </form>
          ) : null}
        </SectionCard>
      ) : null}
      {activeTab === "scope" ? (
        <SectionCard title="Escopo do projeto" description="Dados tecnicos e resumo usado no Portal do Cliente.">
          <ReadonlyDetails items={[
            ["Tipo", project.type],
            ["Escopo", project.scope],
            ["Descricao", project.description || "Sem descricao"],
            ["Resumo do cliente", project.clientFacingSummary || "Sem resumo"],
          ]} />
          {permissions.canManageScope ? (
            <form onSubmit={handleScopeSubmit} className="mt-6 grid gap-4">
              <Field label="Tipo" name="type" defaultValue={project.type} required />
              <Field label="Escopo" name="scope" defaultValue={project.scope} required />
              <TextareaField label="Descricao interna" name="description" defaultValue={project.description ?? ""} />
              <TextareaField label="Resumo para o cliente" name="clientFacingSummary" defaultValue={project.clientFacingSummary ?? ""} />
              <TextareaField label="Notas internas" name="internalNotes" defaultValue={project.internalNotes ?? ""} />
              <AdminButton type="submit" disabled={saving}>Salvar escopo</AdminButton>
            </form>
          ) : null}
        </SectionCard>
      ) : null}
      {activeTab === "stages" ? (
        <SectionCard title="Etapas" description="Etapas do projeto e status de publicacao para o cliente.">
          <ItemList
            items={data.stages}
            emptyTitle="Nenhuma etapa cadastrada."
            actions={(item) => permissions.canManageStages ? (
              <AdminButton variant="secondary" disabled={saving} onClick={() => void execute(() => adminPortalApi.stages.sendToClient(item.id), "Etapa publicada para o cliente.")}>Publicar</AdminButton>
            ) : null}
          />
          {permissions.canManageStages ? <StageForm onSubmit={handleCreateStage} saving={saving} /> : null}
        </SectionCard>
      ) : null}
      {activeTab === "briefings" ? (
        <SectionCard title="Briefing" description="Briefings criados e respostas recebidas no contexto do projeto.">
          <ItemList
            items={data.briefings}
            emptyTitle="Nenhum briefing cadastrado."
            actions={(item) => permissions.canManageBriefings ? (
              <AdminButton variant="secondary" disabled={saving} onClick={() => void execute(() => adminPortalApi.briefings.send(item.id), "Briefing enviado ao cliente.")}>
                <Send className="h-4 w-4" />
                Enviar
              </AdminButton>
            ) : null}
          />
          {permissions.canManageBriefings ? <BriefingForm onSubmit={handleCreateBriefing} saving={saving} /> : null}
        </SectionCard>
      ) : null}
      {activeTab === "files" ? (
        <SectionCard title="Arquivos" description="Uploads, anexos e revisoes de arquivos do projeto.">
          <ItemList
            items={data.files}
            emptyTitle="Nenhum arquivo vinculado."
            actions={(item) => permissions.canManageFiles ? (
              <>
                {item.status === "PENDING_REVIEW" ? (
                  <>
                    <AdminButton variant="secondary" disabled={saving} onClick={() => void execute(() => approveAdminFile(item.id), "Arquivo aprovado.")}>
                      <CheckCircle2 className="h-4 w-4" />
                      Aprovar
                    </AdminButton>
                    <AdminButton variant="secondary" disabled={saving} onClick={() => void execute(() => rejectAdminFile(item.id, "Rejeitado pela equipe Ateliux."), "Arquivo rejeitado.")}>Rejeitar</AdminButton>
                  </>
                ) : null}
                {item.status !== "DELETED" ? (
                  <>
                    <AdminButton variant="secondary" disabled={saving} onClick={() => handleDownloadFile(item.id)}>Baixar</AdminButton>
                    <AdminButton variant="danger" disabled={saving} onClick={() => void execute(() => deleteAdminFile(item.id), "Arquivo excluido.")}>Excluir</AdminButton>
                  </>
                ) : null}
              </>
            ) : null}
          />
          {permissions.canManageFiles ? (
            <form onSubmit={handleUploadFile} className="mt-6 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Contexto
                <select name="context" defaultValue="client_file" className={inputClassName}>
                  <option value="client_file">Arquivo do cliente</option>
                  <option value="briefing_attachment">Anexo de briefing</option>
                  <option value="approval_attachment">Anexo de aprovacao</option>
                  <option value="preview_asset">Asset de preview</option>
                  <option value="finance_receipt">Recibo financeiro</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Arquivo
                <input name="file" type="file" className={inputClassName} required />
              </label>
              <AdminButton type="submit" disabled={saving}>
                <UploadCloud className="h-4 w-4" />
                Enviar arquivo
              </AdminButton>
            </form>
          ) : null}
        </SectionCard>
      ) : null}
      {activeTab === "approvals" ? (
        <SectionCard title="Aprovacoes" description="Solicitacoes formais de aprovacao vinculadas ao projeto.">
          <ItemList
            items={data.approvals}
            emptyTitle="Nenhuma aprovacao criada."
            actions={(item) => permissions.canManageApprovals ? (
              <AdminButton variant="secondary" disabled={saving} onClick={() => void execute(() => adminPortalApi.approvals.send(item.id), "Aprovacao enviada ao cliente.")}>Enviar</AdminButton>
            ) : null}
          />
          {permissions.canManageApprovals ? <ApprovalForm onSubmit={handleCreateApproval} saving={saving} /> : null}
        </SectionCard>
      ) : null}
      {activeTab === "previews" ? (
        <SectionCard title="Preview" description="Links de preview enviados para validacao.">
          <ItemList
            items={data.previews}
            emptyTitle="Nenhum preview cadastrado."
            actions={(item) => (
              <>
                {item.url ? (
                  <a href={String(item.url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </a>
                ) : null}
                {permissions.canManagePreviews ? (
                  <AdminButton variant="secondary" disabled={saving} onClick={() => void execute(() => adminPortalApi.previews.sendForApproval(item.id), "Preview enviado para aprovacao.")}>Enviar para aprovacao</AdminButton>
                ) : null}
              </>
            )}
          />
          {permissions.canManagePreviews ? <PreviewForm onSubmit={handleCreatePreview} saving={saving} /> : null}
        </SectionCard>
      ) : null}
      {activeTab === "schedule" ? (
        <SectionCard title="Cronograma" description="Eventos e entregas visiveis ou internas do projeto.">
          <ItemList items={data.schedule} emptyTitle="Nenhum evento no cronograma." />
          {permissions.canManageSchedule ? <ScheduleForm onSubmit={handleCreateSchedule} saving={saving} /> : null}
        </SectionCard>
      ) : null}
      {activeTab === "finance" ? (
        <SectionCard title="Financeiro" description="Cobranças do projeto. Apenas roles permitidas recebem estes dados do backend.">
          {permissions.canViewFinance ? (
            <>
              <ItemList items={data.finance} emptyTitle="Nenhum registro financeiro." />
              {permissions.canManageFinance ? <FinanceForm onSubmit={handleCreateFinance} saving={saving} /> : null}
            </>
          ) : (
            <EmptyState title="Sem permissao para financeiro." description="Seu perfil pode abrir o projeto, mas o backend nao retorna dados financeiros para esta role." />
          )}
        </SectionCard>
      ) : null}
      {activeTab === "history" ? (
        <SectionCard title="Historico" description="Eventos de auditoria e notas manuais deste projeto.">
          <ItemList items={data.history} emptyTitle="Nenhum historico registrado." />
          {permissions.canManageHistory ? <HistoryForm onSubmit={handleCreateHistory} saving={saving} /> : null}
        </SectionCard>
      ) : null}
      {activeTab === "portal" ? (
        <SectionCard title="Configuracoes do Portal" description="Controle de visibilidade, progresso e resumo entregue ao cliente.">
          <ReadonlyDetails items={[
            ["Visibilidade", project.visibleToClient ? "Publicado" : "Interno"],
            ["Status", normalizeStatus(project.status)],
            ["Etapa atual", project.currentStage || "Nao definida"],
            ["Progresso", `${project.progress}%`],
            ["Prazo", formatDate(project.deadline)],
          ]} />
          {permissions.canManagePortalSettings ? (
            <form onSubmit={handlePortalSubmit} className="mt-6 grid gap-4">
              <label className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                <input name="visibleToClient" type="checkbox" defaultChecked={project.visibleToClient} className="h-4 w-4 accent-[#00B074]" />
                Publicar este projeto no Portal do Cliente
              </label>
              <SelectField label="Status" name="status" defaultValue={project.status} options={["DRAFT", "ACTIVE", "WAITING_CLIENT", "IN_REVIEW", "COMPLETED", "ARCHIVED"]} />
              <Field label="Etapa atual" name="currentStage" defaultValue={project.currentStage ?? ""} required />
              <Field label="Progresso" name="progress" type="number" min={0} max={100} defaultValue={String(project.progress)} required />
              <Field label="Prazo" name="deadline" type="date" defaultValue={dateInputValue(project.deadline)} required />
              <TextareaField label="Resumo para o cliente" name="clientFacingSummary" defaultValue={project.clientFacingSummary ?? project.scope} />
              <AdminButton type="submit" disabled={saving}>Salvar configuracoes</AdminButton>
            </form>
          ) : null}
        </SectionCard>
      ) : null}
    </div>
  );
}

function renderOverview(data: AdminProjectWorkspace) {
  const stats = data.stats;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard title="Resumo operacional" description="Indicadores consolidados diretamente do backend.">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoTile label="Etapas" value={String(stats.stages)} />
          <InfoTile label="Briefings" value={String(stats.briefings)} />
          <InfoTile label="Aprovacoes pendentes" value={String(stats.pendingApprovals)} />
          <InfoTile label="Arquivos pendentes" value={String(stats.pendingFiles)} />
          <InfoTile label="Solicitacoes abertas" value={String(stats.openRequests)} />
          <InfoTile label="Eventos futuros" value={String(stats.upcomingEvents)} />
          <InfoTile label="Financeiro pendente" value={String(stats.pendingPayments)} />
          <InfoTile label="Historico" value={String(stats.historyEvents)} />
          <InfoTile label="Conversas" value={String(stats.inboxThreads)} />
        </div>
      </SectionCard>
      <SectionCard title="Solicitacoes e inbox" description="Ultimos pontos que exigem acompanhamento.">
        <ItemList items={[...data.requests.slice(0, 3), ...data.inbox.slice(0, 3)]} emptyTitle="Sem solicitacoes ou conversas recentes." compact />
      </SectionCard>
    </div>
  );
}

function renderClient(data: AdminProjectWorkspace) {
  const client = data.client;
  return (
    <SectionCard title="Cliente" description="Dados do cliente dono deste projeto.">
      <ReadonlyDetails items={[
        ["Nome", client.name],
        ["Empresa", client.company],
        ["E-mail", client.email],
        ["Telefone", client.phone || "Nao informado"],
        ["Plano", client.plan],
        ["Status", normalizeStatus(client.status)],
        ["Conta", client.account ? normalizeStatus(client.account.inviteStatus) : "Sem conta vinculada"],
        ["Ultimo acesso", formatDate(client.account?.lastAccessAt)],
      ]} />
      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-900">Projetos do cliente</h3>
        <div className="mt-3 grid gap-3">
          {client.projects.map((project) => (
            <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-gray-900">{project.name}</p>
                <p className="text-xs text-gray-500">{project.progress}% - {normalizeStatus(project.status)}</p>
              </div>
              <Badge variant={project.visibleToClient ? "green" : "gray"}>{project.visibleToClient ? "Portal" : "Interno"}</Badge>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function ReadonlyTeam({ data }: { data: AdminProjectWorkspace }) {
  if (!data.team.length) return <EmptyState title="Nenhum membro vinculado." description="Defina um responsavel principal para publicar o projeto com seguranca." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.team.map((member) => (
        <div key={member.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
            <Badge variant={member.primary ? "green" : "gray"}>{member.primary ? "Responsavel" : "Equipe"}</Badge>
          </div>
          <p className="mt-3 text-xs font-semibold text-gray-500">{normalizeStatus(member.role)}</p>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ReadonlyDetails({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-gray-800">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ItemList({
  items,
  emptyTitle,
  actions,
  compact = false,
}: {
  items: AdminProjectWorkspaceItem[];
  emptyTitle: string;
  actions?: (item: AdminProjectWorkspaceItem) => ReactNode;
  compact?: boolean;
}) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const status = asString(item.status, asString(item.visibility, asString(item.priority, "")));
        return (
          <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">{itemTitle(item)}</h3>
                  {status ? <Badge variant={badgeVariant(status)}>{normalizeStatus(status)}</Badge> : null}
                </div>
                <p className={`mt-2 text-sm leading-6 text-gray-500 ${compact ? "line-clamp-2" : ""}`}>{itemDescription(item)}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-gray-400">
                  <span>{formatDate(asString(item.createdAt, asString(item.date, asString(item.dueDate, ""))))}</span>
                  {item.amount !== undefined && item.amount !== null ? <span>{formatCurrency(item.amount)}</span> : null}
                  {item.riskLevel ? <span>{normalizeStatus(String(item.riskLevel))}</span> : null}
                  {item.downloadMode ? <span>{normalizeStatus(String(item.downloadMode))}</span> : null}
                  {item.url ? <span>{String(item.url)}</span> : null}
                </div>
              </div>
              {actions ? <div className="flex flex-wrap justify-end gap-2">{actions(item)}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StageForm({ onSubmit, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <CreateBox title="Nova etapa" onSubmit={onSubmit} saving={saving}>
      <Field label="Titulo" name="title" required />
      <TextareaField label="Descricao" name="description" required />
      <SelectField label="Status" name="status" defaultValue="IN_PROGRESS" options={["DRAFT", "IN_PROGRESS", "SENT_TO_CLIENT", "WAITING_APPROVAL"]} />
      <label className="flex items-center gap-3 text-sm font-semibold text-gray-700"><input name="requiresApproval" type="checkbox" className="h-4 w-4 accent-[#00B074]" /> Exige aprovacao</label>
    </CreateBox>
  );
}

function BriefingForm({ onSubmit, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <CreateBox title="Novo briefing" onSubmit={onSubmit} saving={saving}>
      <Field label="Titulo" name="title" required />
      <Field label="Tipo" name="type" defaultValue="Briefing" />
      <TextareaField label="Descricao" name="description" required />
      <SelectField label="Status" name="status" defaultValue="DRAFT" options={["DRAFT", "SENT", "ANSWERED", "IN_REVIEW"]} />
      <SelectField label="Visibilidade" name="visibility" defaultValue="INTERNAL" options={["INTERNAL", "VISIBLE_TO_CLIENT"]} />
    </CreateBox>
  );
}

function ApprovalForm({ onSubmit, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <CreateBox title="Nova aprovacao" onSubmit={onSubmit} saving={saving}>
      <Field label="Titulo" name="title" required />
      <Field label="Tipo" name="type" defaultValue="Entrega" required />
      <TextareaField label="Mensagem" name="message" required />
      <SelectField label="Status" name="status" defaultValue="DRAFT" options={["DRAFT", "SENT", "WAITING_CLIENT"]} />
    </CreateBox>
  );
}

function PreviewForm({ onSubmit, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <CreateBox title="Novo preview" onSubmit={onSubmit} saving={saving}>
      <Field label="Titulo" name="title" required />
      <Field label="URL" name="url" type="url" required />
      <Field label="Versao" name="version" defaultValue="v1" required />
      <SelectField label="Status" name="status" defaultValue="DRAFT" options={["DRAFT", "SENT", "IN_APPROVAL"]} />
    </CreateBox>
  );
}

function ScheduleForm({ onSubmit, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <CreateBox title="Novo evento" onSubmit={onSubmit} saving={saving}>
      <Field label="Titulo" name="title" required />
      <Field label="Tipo" name="type" defaultValue="Entrega" required />
      <Field label="Data" name="date" type="date" required />
      <Field label="Horario" name="time" type="time" />
      <Field label="Responsavel" name="responsible" />
      <TextareaField label="Notas" name="notes" />
      <SelectField label="Visibilidade" name="visibility" defaultValue="VISIBLE_TO_CLIENT" options={["VISIBLE_TO_CLIENT", "INTERNAL"]} />
    </CreateBox>
  );
}

function FinanceForm({ onSubmit, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <CreateBox title="Novo registro financeiro" onSubmit={onSubmit} saving={saving}>
      <Field label="Descricao" name="description" required />
      <Field label="Valor" name="amount" type="number" step="0.01" min={0} required />
      <Field label="Vencimento" name="dueDate" type="date" required />
      <Field label="Parcela" name="installment" defaultValue="1/1" />
      <SelectField label="Status" name="status" defaultValue="PENDING" options={["PENDING", "PAID", "OVERDUE", "CANCELLED"]} />
      <label className="flex items-center gap-3 text-sm font-semibold text-gray-700"><input name="visibleToClient" type="checkbox" defaultChecked className="h-4 w-4 accent-[#00B074]" /> Visivel para o cliente</label>
    </CreateBox>
  );
}

function HistoryForm({ onSubmit, saving }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <CreateBox title="Nova nota no historico" onSubmit={onSubmit} saving={saving}>
      <Field label="Titulo" name="title" />
      <TextareaField label="Descricao" name="description" required />
    </CreateBox>
  );
}

function CreateBox({ title, onSubmit, saving, children }: { title: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; saving: boolean; children: ReactNode }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      <AdminButton type="submit" disabled={saving}>Salvar</AdminButton>
    </form>
  );
}

function Field({ label, name, defaultValue = "", type = "text", ...props }: { label: string; name: string; defaultValue?: string; type?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-gray-700">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className={inputClassName} {...props} />
    </label>
  );
}

function TextareaField({ label, name, defaultValue = "", ...props }: { label: string; name: string; defaultValue?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-gray-700 md:col-span-2">
      {label}
      <textarea name={name} defaultValue={defaultValue} className={textareaClassName} {...props} />
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-gray-700">
      {label}
      <select name={name} defaultValue={defaultValue} className={inputClassName}>
        {options.map((option) => <option key={option} value={option}>{normalizeStatus(option)}</option>)}
      </select>
    </label>
  );
}

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, name: string) {
  const value = Number(formText(formData, name));
  return Number.isFinite(value) ? value : 0;
}

function itemTitle(item: AdminProjectWorkspaceItem) {
  return asString(item.title, asString(item.name, asString(item.subject, "Registro")));
}

function itemDescription(item: AdminProjectWorkspaceItem) {
  const metadata = item.metadata;
  if (metadata && typeof metadata === "object" && "description" in metadata && typeof metadata.description === "string") {
    return metadata.description;
  }
  return asString(item.description, asString(item.message, asString(item.preview, asString(item.response, "Sem descricao."))));
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

function formatCurrency(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

function dateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function badgeVariant(status: string): BadgeVariant {
  const normalized = status.toUpperCase();
  if (["ACTIVE", "APPROVED", "COMPLETED", "PAID", "VISIBLE_TO_CLIENT", "SENT_TO_CLIENT"].includes(normalized)) return "green";
  if (["WAITING_CLIENT", "WAITING_APPROVAL", "PENDING", "PENDING_REVIEW", "IN_REVIEW", "IN_PROGRESS", "SENT"].includes(normalized)) return "yellow";
  if (["REJECTED", "OVERDUE", "CANCELLED"].includes(normalized)) return "red";
  if (["DRAFT", "INTERNAL", "ARCHIVED"].includes(normalized)) return "gray";
  return "blue";
}
