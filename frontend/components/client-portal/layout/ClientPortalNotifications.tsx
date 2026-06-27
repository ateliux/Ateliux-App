"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { clientApprovals, clientHistory, clientRequests } from "@/data/client-portal/client-portal-mock-data";

export function ClientPortalNotifications({ onClose }: { onClose: () => void }) {
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [onClose]);
  if (typeof document === "undefined") return null;

  const items = [
    { id: "approval", title: `${clientApprovals.filter((item) => item.status === "pending").length} aprovacao pendente`, detail: "A home aguarda seu retorno.", href: "/cliente/aprovacoes" },
    { id: "request", title: "Solicitacao respondida", detail: clientRequests[1].title, href: "/cliente/solicitacoes" },
    { id: "history", title: clientHistory.at(-1)?.title ?? "Projeto atualizado", detail: "Nova atualizacao registrada no historico.", href: "/cliente/historico" },
  ];

  return createPortal(<><button type="button" onClick={onClose} aria-label="Fechar notificacoes" className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-[1px]" /><aside className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm overflow-y-auto border-l border-slate-100 bg-white p-6 shadow-2xl" aria-label="Notificacoes"><div className="mb-6 flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Portal do Cliente</p><h2 className="mt-1 text-lg font-bold text-slate-900">Notificacoes</h2></div><button type="button" onClick={onClose} aria-label="Fechar notificacoes" className="rounded-lg bg-slate-50 p-2 text-slate-400 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><X className="h-5 w-5" aria-hidden="true" /></button></div><div className="space-y-3">{items.map((item) => <Link key={item.id} href={item.href} onClick={onClose} className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-white"><Bell className="h-4 w-4" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-slate-900">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.detail}</span></span></Link>)}</div></aside></>, document.body);
}
