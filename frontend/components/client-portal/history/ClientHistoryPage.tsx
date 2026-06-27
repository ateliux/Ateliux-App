"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { clientHistory } from "@/data/client-portal/client-portal-mock-data";
import type { ClientHistoryItem } from "@/types/client-portal";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";

const typeLabel: Record<ClientHistoryItem["type"], string> = { project: "Projeto", approval: "Aprovacao", request: "Solicitacao", file: "Arquivo", deployment: "Deploy" };

export function ClientHistoryPage() {
  const [filter, setFilter] = useState<"all" | ClientHistoryItem["type"]>("all");
  const [selected, setSelected] = useState<ClientHistoryItem | null>(null);
  const items = filter === "all" ? clientHistory.slice().reverse() : clientHistory.filter((item) => item.type === filter).reverse();
  return <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Linha do tempo" title="Historico do projeto" description="Todas as principais decisoes, entregas e atualizacoes em ordem cronologica." /><div className="mb-6 flex flex-wrap gap-2">{(["all", "project", "approval", "request", "file", "deployment"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-xs font-semibold ${filter === value ? "bg-black text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{value === "all" ? "Todos" : typeLabel[value]}</button>)}</div><ClientPortalCard className="p-6 sm:p-8"><div className="space-y-0">{items.map((item, index) => <div key={item.id} className="relative pb-8 pl-12 last:pb-0">{index < items.length - 1 ? <span className="absolute left-[17px] top-9 h-[calc(100%-12px)] w-px bg-slate-200" /> : null}<span className="absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full bg-black text-white"><Clock3 className="h-4 w-4" /></span><button type="button" onClick={() => setSelected(item)} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-3"><h2 className="font-bold text-slate-900">{item.title}</h2><ClientPortalBadge>{typeLabel[item.type]}</ClientPortalBadge></div><span className="text-[11px] text-slate-400">{item.date}, {item.time}</span></div><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p><p className="mt-2 text-xs text-slate-400">Responsavel: {item.responsible}</p></button></div>)}</div></ClientPortalCard>{selected ? <ClientPortalModal title={selected.title} description={`${selected.date} as ${selected.time}`} onClose={() => setSelected(null)}><ClientPortalBadge>{typeLabel[selected.type]}</ClientPortalBadge><p className="mt-4 text-sm leading-6 text-slate-600">{selected.description}</p><div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">Responsavel:</span> <strong>{selected.responsible}</strong><br /><span className="text-slate-500">Status:</span> <strong>{selected.status}</strong></div>{selected.relatedHref ? <div className="mt-6 flex justify-end"><Link href={selected.relatedHref} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Abrir item relacionado<ArrowRight className="h-4 w-4" /></Link></div> : null}</ClientPortalModal> : null}</div>;
}
