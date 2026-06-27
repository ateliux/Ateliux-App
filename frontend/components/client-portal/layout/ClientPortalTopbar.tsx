"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/components/auth/MockAuthProvider";
import { isApiError } from "@/lib/api/client";
import { toClientNotificationItem } from "@/lib/client-portal/api-adapters";
import { clientPortalNavigation } from "@/data/client-portal/client-portal-navigation";
import { listClientNotifications } from "@/services/client-notifications.service";
import { listClientProjects } from "@/services/client-projects.service";
import { ClientPortalToast } from "@/components/client-portal/ui/ClientPortalToast";
import { ClientPortalNotifications } from "./ClientPortalNotifications";

type ProjectOption = {
  id: string;
  name: string;
};

function InitialsAvatar({ name }: { name: string }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "C";
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">{initials}</span>;
}

export function ClientPortalTopbar({ onExit }: { onExit: () => void }) {
  const router = useRouter();
  const { user, client } = useAuth();
  const [project, setProject] = useState<ProjectOption | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const displayName = user?.name ?? client?.name ?? "Cliente Ateliux";
  const company = client?.company ?? project?.name ?? "Portal do Cliente";

  const loadTopbarData = useCallback(async () => {
    try {
      const [projects, notifications] = await Promise.all([
        listClientProjects<ProjectOption>().catch(() => []),
        listClientNotifications<Record<string, unknown>>(),
      ]);
      setProject(projects[0] ?? null);
      setUnreadCount(notifications.map(toClientNotificationItem).filter((item) => !item.read).length);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        router.replace("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTopbarData();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadTopbarData]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("query")).trim();
    if (!query) return;
    setToast(`Busca por "${query}" registrada no portal.`);
    window.setTimeout(() => setToast(""), 2600);
  }

  function handleNotificationRead() {
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  return <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-8"><button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu do portal" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:hidden"><Menu className="h-5 w-5" aria-hidden="true" /></button><form onSubmit={search} className="relative hidden max-w-md flex-1 sm:block"><label><span className="sr-only">Pesquisar no portal</span><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input name="query" type="search" placeholder="Pesquisar no portal..." className="w-full rounded-xl border border-transparent bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200" /></label></form><div className="ml-auto flex items-center gap-2 sm:gap-5"><button type="button" onClick={() => setNotificationsOpen(true)} aria-label="Abrir notificacoes" aria-expanded={notificationsOpen} className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><Bell className="h-5 w-5" aria-hidden="true" />{unreadCount > 0 ? <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}</button><Link href="/cliente/projeto" className="flex items-center gap-3 border-l border-slate-100 pl-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-black sm:pl-5"><span className="hidden text-right md:block"><span className="block text-sm font-semibold text-slate-900">{displayName}</span><span className="block max-w-44 truncate text-xs text-slate-500">{company}</span></span><InitialsAvatar name={displayName} /><ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden="true" /></Link></div>{notificationsOpen ? <ClientPortalNotifications onClose={() => setNotificationsOpen(false)} onRead={handleNotificationRead} /> : null}{mobileMenuOpen ? <div className="fixed inset-0 z-[80] bg-white p-5 lg:hidden"><div className="mb-5 flex items-center justify-between"><p className="font-bold text-slate-900">Portal do Cliente</p><button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu" className="rounded-lg p-2 text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><X className="h-5 w-5" /></button></div><nav className="grid gap-1">{clientPortalNavigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><item.icon className="h-5 w-5" />{item.label}</Link>)}</nav><button type="button" onClick={() => { setMobileMenuOpen(false); onExit(); }} className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">Sair</button></div> : null}{toast ? <ClientPortalToast message={toast} /> : null}</header>;
}
