"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ExternalLink, MessageSquareText, MonitorPlay } from "lucide-react";
import { clientPreviews as initialPreviews } from "@/data/client-portal/client-portal-mock-data";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { toClientPreview } from "@/lib/client-portal/api-adapters";
import { listClientPreviews } from "@/services/client-previews.service";
import type { ClientPreview } from "@/types/client-portal";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalTextarea } from "@/components/client-portal/ui/ClientPortalFields";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { ClientPortalToast } from "@/components/client-portal/ui/ClientPortalToast";
import { statusVariant } from "@/components/client-portal/ui/client-portal-status";

const statusLabel: Record<ClientPreview["status"], string> = { available: "Disponivel", in_review: "Em revisao", unavailable: "Indisponivel" };

export function ClientPreviewPage() {
  const [previews, setPreviews] = useState<ClientPreview[]>([]);
  const [commenting, setCommenting] = useState<ClientPreview | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadPreviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listClientPreviews<Record<string, unknown>>();
      setPreviews(response.map(toClientPreview));
    } catch (loadError) {
      if (canUseDevFallback("frontend/client-previews")) {
        setPreviews(initialPreviews);
      } else {
        setPreviews([]);
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar as previews.");
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPreviews();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadPreviews]);
  function comment(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!commenting) return; const value = String(new FormData(event.currentTarget).get("comment")); setPreviews((current) => current.map((item) => item.id === commenting.id ? { ...item, comments: [...item.comments, value] } : item)); setCommenting(null); setToast("Comentario vinculado a previa."); window.setTimeout(() => setToast(""), 2600); }
  return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Ambiente de revisao" title="Previa do projeto" description="Acesse as paginas liberadas e registre comentarios diretamente no contexto correto." />{loading ? <LoadingState title="Carregando previews" /> : error ? <ErrorState title="Nao foi possivel carregar as previews" description={error} onRetry={loadPreviews} /> : previews.length === 0 ? <EmptyState title="Nenhuma preview publicada" description="Quando a equipe enviar uma preview para voce, ela aparecera aqui." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{previews.map((preview) => <ClientPortalCard key={preview.apiId ?? preview.id} className="flex flex-col p-6"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100"><MonitorPlay className="h-5 w-5" /></span><ClientPortalBadge variant={statusVariant(preview.status)}>{statusLabel[preview.status]}</ClientPortalBadge></div><h2 className="mt-5 font-bold text-slate-900">{preview.page}</h2><p className="mt-1 text-xs text-slate-400">Atualizada em {preview.updatedAt}</p><div className="mt-4 min-h-20 rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-400">Comentarios</p>{preview.comments.length ? preview.comments.map((comment) => <p key={comment} className="mt-2 text-xs leading-5 text-slate-600">{comment}</p>) : <p className="mt-2 text-xs text-slate-400">Nenhum comentario registrado nesta sessao.</p>}</div><div className="mt-auto flex flex-wrap gap-2 pt-5">{preview.url && preview.status !== "unavailable" ? <a href={preview.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white">Abrir previa<ExternalLink className="h-3.5 w-3.5" /></a> : <ClientPortalButton disabled>Indisponivel</ClientPortalButton>}<ClientPortalButton variant="secondary" onClick={() => setCommenting(preview)}><MessageSquareText className="h-4 w-4" />Comentar</ClientPortalButton></div></ClientPortalCard>)}</div>}{commenting ? <ClientPortalModal title={`Comentar: ${commenting.page}`} description="O comentario ficara visivel nesta sessao da interface." onClose={() => setCommenting(null)}><form onSubmit={comment} className="space-y-5"><ClientPortalTextarea name="comment" label="Comentario ou ajuste solicitado" rows={5} required /><div className="flex justify-end gap-3"><ClientPortalButton variant="secondary" onClick={() => setCommenting(null)}>Cancelar</ClientPortalButton><ClientPortalButton type="submit">Enviar comentario</ClientPortalButton></div></form></ClientPortalModal> : null}{toast ? <ClientPortalToast message={toast} /> : null}</div>;
}
