"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Check, Eye, MessageSquareText } from "lucide-react";
import { clientApprovals as initialApprovals } from "@/data/client-portal/client-portal-mock-data";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { toClientApproval } from "@/lib/client-portal/api-adapters";
import { approveClientApproval, listClientApprovals, requestClientApprovalChanges } from "@/services/client-approvals.service";
import type { ClientApproval } from "@/types/client-portal";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { ClientPortalTextarea } from "@/components/client-portal/ui/ClientPortalFields";
import { ClientPortalToast } from "@/components/client-portal/ui/ClientPortalToast";
import { approvalStatusLabel, statusVariant } from "@/components/client-portal/ui/client-portal-status";

export function ClientApprovalsPage() {
  const [approvals, setApprovals] = useState<ClientApproval[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [adjusting, setAdjusting] = useState<ClientApproval | null>(null);
  const [preview, setPreview] = useState<ClientApproval | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listClientApprovals<Record<string, unknown>>();
      setApprovals(response.map(toClientApproval));
      setSource("api");
    } catch (loadError) {
      if (canUseDevFallback("frontend/client-approvals")) {
        setApprovals(initialApprovals);
        setSource("mock");
      } else {
        setApprovals([]);
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar as aprovacoes.");
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadApprovals();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadApprovals]);

  async function approve(item: ClientApproval) {
    try {
      if (source === "api") await approveClientApproval(item.apiId ?? String(item.id));
      setApprovals((current) => current.map((approval) => approval.id === item.id ? { ...approval, status: "approved", comment: "Aprovado pelo cliente no portal." } : approval));
      notify(`${item.title} aprovado com sucesso.`);
    } catch (approvalError) {
      notify(approvalError instanceof Error ? approvalError.message : "Nao foi possivel aprovar.");
    }
  }
  async function requestChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adjusting) return;
    const comment = String(new FormData(event.currentTarget).get("comment"));
    try {
      if (source === "api") await requestClientApprovalChanges(adjusting.apiId ?? String(adjusting.id), comment);
      setApprovals((current) => current.map((item) => item.id === adjusting.id ? { ...item, status: "changes_requested", comment } : item));
      setAdjusting(null);
      notify("Solicitacao de ajuste enviada para a Ateliux.");
    } catch (requestError) {
      notify(requestError instanceof Error ? requestError.message : "Nao foi possivel solicitar ajuste.");
    }
  }

  return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Suas decisoes" title="Aprovacoes" description="Revise entregas, aprove o que esta correto ou envie comentarios objetivos para ajustes." />{loading ? <LoadingState title="Carregando aprovacoes" /> : error ? <ErrorState title="Nao foi possivel carregar as aprovacoes" description={error} onRetry={loadApprovals} /> : approvals.length === 0 ? <EmptyState title="Nenhuma aprovacao pendente" description="As entregas enviadas para revisao aparecerao aqui." /> : <div className="grid gap-5 lg:grid-cols-2">{approvals.map((item) => <ClientPortalCard key={item.apiId ?? item.id} className="flex flex-col p-6"><div className="flex items-start justify-between gap-4"><div><ClientPortalBadge variant={statusVariant(item.status)}>{approvalStatusLabel[item.status]}</ClientPortalBadge><h2 className="mt-4 font-bold text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p></div><span className="text-[11px] text-slate-400">{item.sentAt}</span></div>{item.comment ? <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong>Comentario:</strong> {item.comment}</div> : null}<p className="mt-4 text-xs text-slate-400">Responsavel: {item.responsible}</p><div className="mt-auto flex flex-wrap gap-3 pt-6"><ClientPortalButton variant="secondary" onClick={() => setPreview(item)}><Eye className="h-4 w-4" />{item.previewLabel}</ClientPortalButton>{item.status !== "approved" ? <ClientPortalButton onClick={() => void approve(item)}><Check className="h-4 w-4" />Aprovar</ClientPortalButton> : null}<ClientPortalButton variant="ghost" onClick={() => setAdjusting(item)}><MessageSquareText className="h-4 w-4" />Solicitar ajuste</ClientPortalButton></div></ClientPortalCard>)}</div>}{adjusting ? <ClientPortalModal title={`Solicitar ajuste: ${adjusting.title}`} description="Descreva o que precisa mudar. Seu comentario ficara registrado na aprovacao." onClose={() => setAdjusting(null)}><form onSubmit={(event) => void requestChanges(event)} className="space-y-5"><ClientPortalTextarea name="comment" label="Comentario do ajuste" rows={5} required /><div className="flex justify-end gap-3"><ClientPortalButton variant="secondary" onClick={() => setAdjusting(null)}>Cancelar</ClientPortalButton><ClientPortalButton type="submit">Enviar ajuste</ClientPortalButton></div></form></ClientPortalModal> : null}{preview ? <ClientPortalModal title={preview.title} description="Previa visual da entrega enviada para aprovacao." onClose={() => setPreview(null)} size="lg"><div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center"><div><Eye className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-4 text-sm font-semibold text-slate-700">{preview.previewLabel}</p><p className="mt-1 text-xs text-slate-400">Abra a area de previews para acessar o link publicado.</p></div></div></ClientPortalModal> : null}{toast ? <ClientPortalToast message={toast} /> : null}</div>;
}
