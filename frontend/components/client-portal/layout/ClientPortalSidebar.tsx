"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { headerContent } from "@/content/home";
import { clientPortalNavigation } from "@/data/client-portal/client-portal-navigation";
import { Logo } from "@/components/ui/Logo";

export function ClientPortalSidebar({ onExit }: { onExit: () => void }) {
  const pathname = usePathname();
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-100 bg-white lg:flex"><Link href="/cliente/visao-geral" aria-label="Ir para a visao geral do Portal do Cliente" className="flex h-20 items-center border-b border-slate-100 px-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"><Logo src={headerContent.logo.src} alt={headerContent.logo.alt} priority className="h-7 w-auto max-w-[150px]" /></Link><div className="px-5 pt-5"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Portal do Cliente</p></div><nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4" aria-label="Navegacao do Portal do Cliente">{clientPortalNavigation.map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${active ? "bg-black text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />{item.label}</Link>; })}</nav><div className="border-t border-slate-100 p-4"><button type="button" onClick={onExit} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><LogOut className="h-4.5 w-4.5" aria-hidden="true" />Sair</button></div></aside>;
}
