"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { crmUsers } from "@/data/crm/crm-mock-data";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";
import { CrmToast } from "@/components/crm/ui/CrmToast";
import { CrmNotificationsPanel } from "./CrmNotificationsPanel";

export function CrmTopbar() {
  const user = crmUsers[0];
  const [toast, setToast] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("query")).trim();
    if (!query) return;
    setToast(`Busca mockada por "${query}" concluida.`);
    window.setTimeout(() => setToast(""), 2800);
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-8">
      <Link
        href="/crm/visao-geral"
        aria-label="Abrir painel do CRM"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Link>

      <form onSubmit={submitSearch} className="relative hidden max-w-lg flex-1 sm:block">
        <label>
          <span className="sr-only">Pesquisar no CRM</span>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input name="query" type="search" placeholder="Pesquisar..." className="w-full rounded-xl border border-transparent bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200" />
        </label>
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-5">
        <button
          type="button"
          onClick={() => setNotificationsOpen(true)}
          aria-label="Abrir notificacoes"
          aria-expanded={notificationsOpen}
          className="relative rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </button>

        <Link
          href="/crm/perfil"
          className="flex items-center gap-3 border-l border-slate-100 pl-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-black sm:pl-5"
        >
          <span className="hidden text-right md:block">
            <span className="block text-sm font-semibold text-slate-800">{user.name}</span>
            <span className="block text-xs text-slate-500">{user.role}</span>
          </span>
          <CrmAvatar src={user.avatar} alt={`Foto de ${user.name}`} />
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden="true" />
        </Link>
      </div>
      {notificationsOpen ? <CrmNotificationsPanel onClose={() => setNotificationsOpen(false)} /> : null}
      {toast ? <CrmToast message={toast} /> : null}
    </header>
  );
}
