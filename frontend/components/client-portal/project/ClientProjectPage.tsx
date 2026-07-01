"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Boxes, CheckCircle2, ExternalLink, FileText, PlugZap, type LucideIcon } from "lucide-react";
import { clientProjects } from "@/data/client-portal/client-portal-mock-data";
import { toClientApproval, toClientHistoryItem, toClientPreview, toClientProject, toClientStage, toClientTeamMember } from "@/lib/client-portal/api-adapters";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { listClientApprovals } from "@/services/client-approvals.service";
import { listClientHistory } from "@/services/client-history.service";
import { listClientPreviews } from "@/services/client-previews.service";
import { getClientProject, listClientProjects } from "@/services/client-projects.service";
import { listClientProjectStages } from "@/services/client-stages.service";
import { listClientTeam } from "@/services/client-team.service";
import type { ClientApproval, ClientHistoryItem, ClientPreview, ClientProject, ClientProjectBlock, ClientProjectStage, ClientTeamMember } from "@/types/client-portal";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { approvalStatusLabel, projectStatusLabel, stageStatusLabel, statusVariant } from "@/components/client-portal/ui/client-portal-status";

type ProjectLinkedData = {
  stages: ClientProjectStage[];
  approvals: ClientApproval[];
  previews: ClientPreview[];
  history: ClientHistoryItem[];
  team: ClientTeamMember[];
  loading: boolean;
  error: string;
};

const emptyLinkedData: ProjectLinkedData = {
  stages: [],
  approvals: [],
  previews: [],
  history: [],
  team: [],
  loading: false,
  error: "",
};

function belongsToProject(record: Record<string, unknown>, projectId: string) {
  const rawProjectId = typeof record.projectId === "string" ? record.projectId : "";
  return !rawProjectId || rawProjectId === projectId;
}

function BlockList({ title, icon: Icon, items, onOpen }: { title: string; icon: LucideIcon; items: ClientProjectBlock[]; onOpen: (item: ClientProjectBlock) => void }) {
  return (
    <ClientPortalCard className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.length ? items.map((item) => (
          <button key={item.id} type="button" onClick={() => onOpen(item)} className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            <span>
              <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
              <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
            </span>
            <ClientPortalBadge variant={statusVariant(item.status)}>{projectStatusLabel[item.status]}</ClientPortalBadge>
          </button>
        )) : <p className="rounded-xl border border-slate-100 p-4 text-xs text-slate-500">Nenhum item publicado.</p>}
      </div>
    </ClientPortalCard>
  );
}

export function ClientProjectPage() {
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [linkedData, setLinkedData] = useState<ProjectLinkedData>(emptyLinkedData);
  const [detail, setDetail] = useState<ClientProjectBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjectDetail = useCallback(async (id: string) => {
    const detailResponse = await getClientProject<Record<string, unknown>>(id);
    const mapped = toClientProject(detailResponse);
    setProjects((current) => current.map((item) => item.apiId === id ? mapped : item));
  }, []);

  const loadLinkedData = useCallback(async (id: string) => {
    if (!id) {
      setLinkedData(emptyLinkedData);
      return;
    }

    setLinkedData((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [stagesResponse, approvalsResponse, previewsResponse, historyResponse, teamResponse] = await Promise.all([
        listClientProjectStages<Record<string, unknown>>(id),
        listClientApprovals<Record<string, unknown>>(),
        listClientPreviews<Record<string, unknown>>(),
        listClientHistory<Record<string, unknown>>(),
        listClientTeam<Record<string, unknown>>(),
      ]);

      setLinkedData({
        stages: stagesResponse.map(toClientStage),
        approvals: approvalsResponse.filter((item) => belongsToProject(item, id)).map(toClientApproval),
        previews: previewsResponse.filter((item) => belongsToProject(item, id)).map(toClientPreview),
        history: historyResponse.filter((item) => belongsToProject(item, id)).map(toClientHistoryItem).slice(0, 5),
        team: teamResponse.filter((item) => belongsToProject(item, id) || Boolean(item.primary)).map(toClientTeamMember),
        loading: false,
        error: "",
      });
    } catch (loadError) {
      setLinkedData({
        ...emptyLinkedData,
        error: loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os modulos vinculados.",
      });
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listClientProjects<Record<string, unknown>>();
      const mapped = response.map(toClientProject);
      const firstId = mapped[0]?.apiId ?? "";
      setProjects(mapped);
      setProjectId(firstId);
      if (firstId) await Promise.all([loadProjectDetail(firstId), loadLinkedData(firstId)]);
    } catch (loadError) {
      if (canUseDevFallback("frontend/client-project")) {
        setProjects(clientProjects);
        setProjectId(String(clientProjects[0]?.id ?? ""));
        setLinkedData(emptyLinkedData);
      } else {
        setProjects([]);
        setLinkedData(emptyLinkedData);
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os projetos.");
      }
    } finally {
      setLoading(false);
    }
  }, [loadLinkedData, loadProjectDetail]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadProjects();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadProjects]);

  async function selectProject(id: string) {
    setProjectId(id);
    if (projects.some((item) => item.apiId === id)) {
      await Promise.all([loadProjectDetail(id), loadLinkedData(id)]).catch(() => undefined);
    }
  }

  const project = projects.find((item) => (item.apiId ?? String(item.id)) === projectId) ?? projects[0];

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <ClientPortalPageHeader
        eyebrow="Escopo contratado"
        title="Meu projeto"
        description="Consulte o briefing, entregaveis e tudo que esta previsto no projeto."
        actions={projects.length > 1 ? (
          <label className="text-xs font-semibold text-slate-500">
            Projeto atual
            <select value={projectId} onChange={(event) => void selectProject(event.target.value)} className="ml-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-black">
              {projects.map((item) => <option key={item.apiId ?? item.id} value={item.apiId ?? String(item.id)}>{item.name}</option>)}
            </select>
          </label>
        ) : undefined}
      />

      {loading ? <LoadingState title="Carregando projeto" /> : error ? <ErrorState title="Nao foi possivel carregar os projetos" description={error} onRetry={loadProjects} /> : !project ? <EmptyState title="Nenhum projeto publicado" description="Quando um projeto for liberado para sua conta, ele aparecera aqui." /> : (
        <>
          <ClientPortalCard className="mb-6 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <ClientPortalBadge variant={statusVariant(project.status)}>{projectStatusLabel[project.status]}</ClientPortalBadge>
                <h2 className="mt-4 text-xl font-bold text-slate-900">{project.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{project.type} - Plano {project.plan}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 md:min-w-[420px] md:text-right">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Etapa atual</p>
                  <p className="mt-2 font-semibold text-slate-900">{project.currentStage}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Progresso</p>
                  <p className="mt-2 font-semibold text-slate-900">{project.progress}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Prazo estimado</p>
                  <p className="mt-2 font-semibold text-slate-900">{project.estimatedDeadline}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Briefing resumido</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{project.briefing}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Publico-alvo</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{project.audience}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-100 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Objetivo</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{project.objective}</p>
            </div>
          </ClientPortalCard>

          <div className="mb-6 grid gap-6 xl:grid-cols-3">
            <BlockList title="Funcionalidades" icon={Boxes} items={project.features} onOpen={setDetail} />
            <BlockList title="Integracoes" icon={PlugZap} items={project.integrations} onOpen={setDetail} />
            <BlockList title="Entregaveis" icon={FileText} items={project.deliverables} onOpen={setDetail} />
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-3">
            <ClientPortalCard className="p-6">
              <h2 className="font-bold text-slate-900">Etapas reais</h2>
              <div className="mt-4 space-y-3">
                {linkedData.loading ? <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">Carregando etapas...</p> : linkedData.stages.length ? linkedData.stages.slice(0, 4).map((stage) => (
                  <div key={stage.apiId ?? stage.id} className="rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{stage.title}</p>
                      <ClientPortalBadge variant={statusVariant(stage.status)}>{stageStatusLabel[stage.status]}</ClientPortalBadge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{stage.description}</p>
                  </div>
                )) : <p className="rounded-xl border border-slate-100 p-4 text-xs text-slate-500">Nenhuma etapa publicada para este projeto.</p>}
              </div>
            </ClientPortalCard>

            <ClientPortalCard className="p-6">
              <h2 className="font-bold text-slate-900">Aprovacoes e previews</h2>
              <div className="mt-4 space-y-3">
                {linkedData.approvals.slice(0, 3).map((approval) => (
                  <Link key={approval.apiId ?? approval.id} href="/cliente/aprovacoes" className="block rounded-xl border border-slate-100 p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{approval.title}</p>
                      <ClientPortalBadge variant={statusVariant(approval.status)}>{approvalStatusLabel[approval.status]}</ClientPortalBadge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{approval.sentAt}</p>
                  </Link>
                ))}
                {linkedData.previews.slice(0, 3).map((preview) => (
                  <a key={preview.apiId ?? preview.id} href={preview.url || undefined} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-100 p-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    {preview.page}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
                {!linkedData.approvals.length && !linkedData.previews.length ? <p className="rounded-xl border border-slate-100 p-4 text-xs text-slate-500">Nenhuma aprovacao ou preview publicado.</p> : null}
              </div>
            </ClientPortalCard>

            <ClientPortalCard className="p-6">
              <h2 className="font-bold text-slate-900">Equipe e historico</h2>
              <div className="mt-4 space-y-3">
                {linkedData.team.slice(0, 3).map((member) => (
                  <div key={member.apiId ?? member.id} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                ))}
                {linkedData.history.slice(0, 3).map((item) => (
                  <div key={item.apiId ?? item.id} className="rounded-xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.date} as {item.time}</p>
                  </div>
                ))}
                {!linkedData.team.length && !linkedData.history.length ? <p className="rounded-xl border border-slate-100 p-4 text-xs text-slate-500">Nenhuma equipe ou historico vinculado.</p> : null}
              </div>
            </ClientPortalCard>
          </div>

          {linkedData.error ? <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{linkedData.error}</div> : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <ClientPortalCard className="p-6">
              <h2 className="font-bold text-slate-900">Paginas incluidas</h2>
              <div className="mt-4 flex flex-wrap gap-2">{project.pages.length ? project.pages.map((page) => <span key={page} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">{page}</span>) : <span className="text-xs text-slate-500">Nao publicado.</span>}</div>
              <h3 className="mt-6 text-sm font-bold text-slate-900">Tecnologias previstas</h3>
              <div className="mt-3 flex flex-wrap gap-2">{project.technologies.length ? project.technologies.map((technology) => <ClientPortalBadge key={technology}>{technology}</ClientPortalBadge>) : <span className="text-xs text-slate-500">Nao publicado.</span>}</div>
            </ClientPortalCard>
            <ClientPortalCard className="p-6">
              <h2 className="font-bold text-slate-900">Links e observacoes</h2>
              <div className="mt-4 space-y-3">{project.usefulLinks.length ? project.usefulLinks.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-100 p-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">{link.label}<ExternalLink className="h-4 w-4" /></a>) : <p className="rounded-xl border border-slate-100 p-4 text-xs text-slate-500">Nenhum link publicado.</p>}</div>
              <ul className="mt-5 space-y-2 text-xs leading-5 text-slate-500">{project.notes.map((note) => <li key={note} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{note}</li>)}</ul>
              <Link href="/cliente/solicitacoes" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Solicitar mudanca<ArrowUpRight className="h-4 w-4" /></Link>
            </ClientPortalCard>
          </div>
        </>
      )}

      {detail ? <ClientPortalModal title={detail.title} description={detail.description} onClose={() => setDetail(null)}><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm text-slate-500">Status deste bloco</span><ClientPortalBadge variant={statusVariant(detail.status)}>{projectStatusLabel[detail.status]}</ClientPortalBadge></div></ClientPortalModal> : null}
    </div>
  );
}
