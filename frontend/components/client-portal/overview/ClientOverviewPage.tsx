"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, CircleAlert, FolderOpen, LifeBuoy } from "lucide-react";
import { useAuth } from "@/components/auth/MockAuthProvider";
import {
  clientApprovals,
  clientFiles,
  clientHistory,
  clientPortalUser,
  clientProjects,
  clientRequests,
  clientScheduleEvents,
  clientTeam,
} from "@/data/client-portal/client-portal-mock-data";
import { clientPortalQuickLinks } from "@/data/client-portal/client-portal-navigation";
import {
  toClientApproval,
  toClientHistoryItem,
  toClientInvoice,
  toClientNotificationItem,
  toClientProject,
  toClientScheduleEvent,
  toClientTeamMember,
  type ClientNotificationItem,
} from "@/lib/client-portal/api-adapters";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { listClientApprovals } from "@/services/client-approvals.service";
import { listClientFiles } from "@/services/client-files.service";
import { listClientFinance } from "@/services/client-finance.service";
import { listClientHistory } from "@/services/client-history.service";
import { listClientNotifications } from "@/services/client-notifications.service";
import { listClientProjects } from "@/services/client-projects.service";
import { listClientRequests } from "@/services/client-requests.service";
import { listClientSchedule } from "@/services/client-schedule.service";
import { listClientTeam } from "@/services/client-team.service";
import type { ClientApproval, ClientFile, ClientHistoryItem, ClientInvoice, ClientProject, ClientRequest, ClientScheduleEvent, ClientTeamMember } from "@/types/client-portal";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { projectStatusLabel, statusVariant } from "@/components/client-portal/ui/client-portal-status";

type OverviewData = {
  projects: ClientProject[];
  approvals: ClientApproval[];
  requests: ClientRequest[];
  files: ClientFile[];
  schedule: ClientScheduleEvent[];
  finance: ClientInvoice[];
  history: ClientHistoryItem[];
  notifications: ClientNotificationItem[];
  team: ClientTeamMember[];
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";
}

const fallbackData: OverviewData = {
  projects: clientProjects,
  approvals: clientApprovals,
  requests: clientRequests,
  files: clientFiles,
  schedule: clientScheduleEvents,
  finance: [],
  history: clientHistory.slice().reverse(),
  notifications: [],
  team: clientTeam,
};

export function ClientOverviewPage() {
  const { user, client } = useAuth();
  const [data, setData] = useState<OverviewData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projects, filesResult, requests, approvals, schedule, finance, history, notifications, team] = await Promise.all([
        listClientProjects<Record<string, unknown>>(),
        listClientFiles(),
        listClientRequests(),
        listClientApprovals<Record<string, unknown>>(),
        listClientSchedule<Record<string, unknown>>(),
        listClientFinance<Record<string, unknown>>(),
        listClientHistory<Record<string, unknown>>(),
        listClientNotifications<Record<string, unknown>>(),
        listClientTeam<Record<string, unknown>>(),
      ]);

      setData({
        projects: projects.map(toClientProject),
        files: filesResult.files,
        requests,
        approvals: approvals.map(toClientApproval),
        schedule: schedule.map(toClientScheduleEvent).filter((event) => event.date),
        finance: finance.map(toClientInvoice),
        history: history.map(toClientHistoryItem),
        notifications: notifications.map(toClientNotificationItem),
        team: team.map(toClientTeamMember),
      });
    } catch (loadError) {
      if (canUseDevFallback("frontend/client-overview")) {
        setData(fallbackData);
      } else {
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar a visao geral.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadOverview();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadOverview]);

  const project = data.projects[0];
  const manager = data.team[0];
  const pendingApprovals = data.approvals.filter((item) => item.status === "pending").length;
  const openRequests = data.requests.filter((item) => item.status === "open" || item.status === "in_review").slice(0, 2);
  const recentFiles = data.files.slice(0, 2);
  const recentHistory = data.history.slice(0, 4);
  const nextEvent = data.schedule[0];
  const pendingFinance = data.finance.filter((item) => item.status !== "paid");
  const unreadNotifications = data.notifications.filter((item) => !item.read).length;
  const firstName = useMemo(() => (user?.name ?? client?.name ?? clientPortalUser.name).split(" ")[0], [client?.name, user?.name]);

  if (loading) return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><LoadingState title="Carregando visao geral" /></div>;
  if (error) return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ErrorState title="Nao foi possivel carregar a visao geral" description={error} onRetry={loadOverview} /></div>;
  if (!project) return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Portal do Cliente Ateliux" title={`Ola, ${firstName}`} description="Seu portal esta ativo, mas ainda nao ha projeto publicado para sua conta." /><EmptyState title="Nenhum projeto publicado" description="Quando a Ateliux liberar um projeto para sua conta, ele aparecera aqui." /></div>;

  return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Portal do Cliente Ateliux" title={`Ola, ${firstName}`} description={`Seu projeto esta em fase de ${project.currentStage}. A proxima etapa e ${project.nextStage.toLowerCase()}.`} actions={<Link href="/cliente/projeto" className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">Ver meu projeto<ArrowRight className="h-4 w-4" /></Link>} />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]"><div className="space-y-6"><ClientPortalCard className="p-6"><div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"><div><ClientPortalBadge variant={statusVariant(project.status)}>{projectStatusLabel[project.status]}</ClientPortalBadge><h2 className="mt-4 text-xl font-bold text-slate-900">{project.name}</h2><p className="mt-1 text-sm text-slate-500">{project.type} - Plano {project.plan}</p></div><div className="text-left sm:text-right"><p className="text-3xl font-bold text-slate-900">{project.progress}%</p><p className="mt-1 text-xs text-slate-400">Progresso geral</p></div></div><div className="mt-6 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-black" style={{ width: `${project.progress}%` }} /></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-400">Etapa atual</p><p className="mt-2 text-sm font-semibold text-slate-900">{project.currentStage}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-400">Aprovacoes</p><p className="mt-2 text-sm font-semibold text-slate-900">{pendingApprovals} pendentes</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-400">Prazo estimado</p><p className="mt-2 text-sm font-semibold text-slate-900">{project.estimatedDeadline}</p></div></div></ClientPortalCard>
      <div className="grid gap-6 md:grid-cols-2"><ClientPortalCard className="p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-bold text-slate-900">Pendencias para voce</h2><CircleAlert className="h-5 w-5 text-amber-500" /></div><Link href="/cliente/aprovacoes" className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4 hover:bg-amber-50"><CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-600" /><span><span className="block text-sm font-semibold text-slate-900">{pendingApprovals} aprovacoes pendentes</span><span className="mt-1 block text-xs leading-5 text-slate-500">Revise as entregas para manter o cronograma.</span></span></Link>{recentFiles[0] ? <Link href="/cliente/arquivos" className="mt-3 flex items-start gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50"><FolderOpen className="mt-0.5 h-5 w-5 text-slate-500" /><span><span className="block text-sm font-semibold text-slate-900">{recentFiles[0].name}</span><span className="mt-1 block text-xs text-slate-500">Arquivo recente: {recentFiles[0].date}</span></span></Link> : null}</ClientPortalCard>
        <ClientPortalCard className="p-6"><h2 className="mb-5 font-bold text-slate-900">Responsavel principal</h2>{manager ? <div className="flex items-center gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">{initials(manager.name)}</span><div><p className="font-semibold text-slate-900">{manager.name}</p><p className="text-sm text-slate-500">{manager.role}</p><ClientPortalBadge variant="success">Disponivel</ClientPortalBadge></div></div> : <p className="text-sm text-slate-500">Nenhum responsavel vinculado ainda.</p>}<div className="mt-5 flex gap-3"><Link href="/cliente/equipe" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Ver equipe</Link><Link href="/cliente/suporte" className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white">Falar com a Ateliux</Link></div></ClientPortalCard></div>
      <ClientPortalCard className="p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-bold text-slate-900">Ultimas atualizacoes</h2><Link href="/cliente/historico" className="text-xs font-semibold text-slate-600 hover:text-black">Ver historico</Link></div><div className="space-y-4">{recentHistory.length ? recentHistory.map((item) => <div key={item.apiId ?? item.id} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-black" /><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{item.title}</p><span className="text-[11px] text-slate-400">{item.date}, {item.time}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p></div></div>) : <p className="text-sm text-slate-500">Nenhuma atualizacao registrada.</p>}</div></ClientPortalCard></div>
      <div className="space-y-6"><ClientPortalCard className="p-5"><h2 className="mb-4 font-bold text-slate-900">Acesso rapido</h2><div className="grid grid-cols-2 gap-3">{clientPortalQuickLinks.map((item) => <Link key={item.href} href={item.href} className="rounded-xl border border-slate-100 p-4 hover:border-slate-300 hover:bg-slate-50"><item.icon className="h-5 w-5 text-black" /><span className="mt-3 block text-xs font-semibold text-slate-800">{item.label}</span></Link>)}</div></ClientPortalCard><ClientPortalCard className="p-5"><div className="flex items-center gap-3"><CalendarClock className="h-5 w-5" /><h2 className="font-bold text-slate-900">Proximo marco</h2></div><p className="mt-4 text-sm font-semibold text-slate-900">{nextEvent?.title ?? "Sem evento publicado"}</p><p className="mt-1 text-xs leading-5 text-slate-500">{nextEvent ? `${nextEvent.date} as ${nextEvent.time}` : "Eventos visiveis aparecem aqui."}</p><Link href="/cliente/cronograma" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-black">Abrir cronograma<ArrowRight className="h-3.5 w-3.5" /></Link></ClientPortalCard><ClientPortalCard className="p-5"><h2 className="font-bold text-slate-900">Resumo financeiro</h2><p className="mt-4 text-sm font-semibold text-slate-900">{pendingFinance.length} pendencias</p><p className="mt-1 text-xs leading-5 text-slate-500">{pendingFinance[0]?.label ?? "Sem cobrancas pendentes."}</p><Link href="/cliente/financeiro" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-black">Abrir financeiro<ArrowRight className="h-3.5 w-3.5" /></Link></ClientPortalCard><ClientPortalCard className="p-5"><h2 className="font-bold text-slate-900">Solicitacoes recentes</h2><div className="mt-4 space-y-3">{openRequests.length ? openRequests.map((request) => <p key={request.id} className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{request.title}</p>) : <p className="text-xs text-slate-500">Nenhuma solicitacao aberta.</p>}</div></ClientPortalCard><ClientPortalCard className="p-5"><h2 className="font-bold text-slate-900">Notificacoes</h2><p className="mt-4 text-sm font-semibold text-slate-900">{unreadNotifications} nao lidas</p><p className="mt-1 text-xs leading-5 text-slate-500">{data.notifications[0]?.title ?? "Nenhuma notificacao nova."}</p></ClientPortalCard><ClientPortalCard className="bg-black p-5 text-white"><LifeBuoy className="h-6 w-6" /><h2 className="mt-4 font-bold">Precisa de ajuda?</h2><p className="mt-2 text-xs leading-5 text-zinc-400">Nossa equipe acompanha seu projeto de perto.</p><Link href="/cliente/suporte" className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black">Abrir suporte</Link></ClientPortalCard></div></div>
  </div>;
}
