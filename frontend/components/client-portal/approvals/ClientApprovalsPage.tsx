"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, MessageSquareText } from "lucide-react";
import { clientApprovals as initialApprovals } from "@/data/client-portal/client-portal-mock-data";
import type { ClientApproval } from "@/types/client-portal";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { ClientPortalTextarea } from "@/components/client-portal/ui/ClientPortalFields";
import { ClientPortalToast } from "@/components/client-portal/ui/ClientPortalToast";
import { approvalStatusLabel, statusVariant } from "@/components/client-portal/ui/client-portal-status";

export function ClientApprovalsPage() {
  const [approvals, setApprovals] = useState<ClientApproval[]>(initialApprovals);
  const [adjusting, setAdjusting] = useState<ClientApproval | null>(null);
  const [preview, setPreview] = useState<ClientApproval | null>(null);
  const [toast, setToast] = useState("");
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };

  function approve(item: ClientApproval) { setApprovals((current) => current.map((approval) => approval.id === item.id ? { ...approval, status: "approved", comment: "Aprovado pelo cliente no portal." } : approval)); notify(`${item.title} aprovado com sucesso.`); }
  function requestChanges(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!adjusting) return; const comment = String(new FormData(event.currentTarget).get("comment")); setApprovals((current) => current.map((item) => item.id === adjusting.id ? { ...item, status: "changes_requested", comment } : item)); setAdjusting(null); notify("Solicitacao de ajuste enviada para a Ateliux."); }

  return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Suas decisoes" title="Aprovacoes" description="Revise entregas, aprove o que esta correto ou envie comentarios objetivos para ajustes." /><div className="grid gap-5 lg:grid-cols-2">{approvals.map((item) => <ClientPortalCard key={item.id} className="flex flex-col p-6"><div className="flex items-start justify-between gap-4"><div><ClientPortalBadge variant={statusVariant(item.status)}>{approvalStatusLabel[item.status]}</ClientPortalBadge><h2 className="mt-4 font-bold text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p></div><span className="text-[11px] text-slate-400">{item.sentAt}</span></div>{item.comment ? <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong>Comentario:</strong> {item.comment}</div> : null}<p className="mt-4 text-xs text-slate-400">Responsavel: {item.responsible}</p><div className="mt-auto flex flex-wrap gap-3 pt-6"><ClientPortalButton variant="secondary" onClick={() => setPreview(item)}><Eye className="h-4 w-4" />{item.previewLabel}</ClientPortalButton>{item.status !== "approved" ? <ClientPortalButton onClick={() => approve(item)}><Check className="h-4 w-4" />Aprovar</ClientPortalButton> : null}<ClientPortalButton variant="ghost" onClick={() => setAdjusting(item)}><MessageSquareText className="h-4 w-4" />Solicitar ajuste</ClientPortalButton></div></ClientPortalCard>)}</div>{adjusting ? <ClientPortalModal title={`Solicitar ajuste: ${adjusting.title}`} description="Descreva o que precisa mudar. Seu comentario ficara registrado apenas no estado local desta demonstracao." onClose={() => setAdjusting(null)}><form onSubmit={requestChanges} className="space-y-5"><ClientPortalTextarea name="comment" label="Comentario do ajuste" rows={5} required /><div className="flex justify-end gap-3"><ClientPortalButton variant="secondary" onClick={() => setAdjusting(null)}>Cancelar</ClientPortalButton><ClientPortalButton type="submit">Enviar ajuste</ClientPortalButton></div></form></ClientPortalModal> : null}{preview ? <ClientPortalModal title={preview.title} description="Previa visual mockada da entrega." onClose={() => setPreview(null)} size="lg"><div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center"><div><Eye className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-4 text-sm font-semibold text-slate-700">{preview.previewLabel}</p><p className="mt-1 text-xs text-slate-400">O link real sera conectado pelo backend futuramente.</p></div></div></ClientPortalModal> : null}{toast ? <ClientPortalToast message={toast} /> : null}</div>;
}
