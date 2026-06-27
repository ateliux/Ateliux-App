"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LifeBuoy, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { headerContent } from "@/content/home";
import { crmNavigation } from "@/data/crm/crm-navigation";
import { Logo } from "@/components/ui/Logo";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmConfirmDialog } from "@/components/crm/ui/CrmConfirmDialog";
import { CrmInput, CrmTextarea } from "@/components/crm/ui/CrmFields";
import { CrmModal } from "@/components/crm/ui/CrmModal";
import { CrmToast } from "@/components/crm/ui/CrmToast";

function isItemActive(pathname: string, href: string) {
  if (href === "/crm/projetos") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function CrmSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [supportOpen, setSupportOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState("");

  function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSupportOpen(false);
    setToast("Solicitacao mockada registrada para demonstracao.");
    window.setTimeout(() => setToast(""), 2800);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-100 bg-white lg:flex">
      <Link
        href="/crm/visao-geral"
        aria-label="Ir para o painel do CRM"
        className="flex h-20 items-center px-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
      >
        <Logo src={headerContent.logo.src} alt={headerContent.logo.alt} priority className="h-7 w-auto max-w-[150px]" />
      </Link>

      <nav className="flex-1 space-y-1.5 px-4 py-5" aria-label="Navegacao do CRM">
        {crmNavigation.map((item) => {
          const active = isItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                active ? "bg-black text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-slate-100 p-4">
          <div className="absolute -bottom-8 -right-7 h-24 w-24 rounded-full bg-slate-200/80" />
          <LifeBuoy className="relative mb-3 h-6 w-6 text-black" aria-hidden="true" />
          <p className="relative text-sm font-semibold text-black">Precisa de ajuda?</p>
          <p className="relative mt-1 text-xs leading-5 text-slate-600">Nossa equipe esta pronta para apoiar.</p>
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="relative mt-3 inline-flex w-full justify-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Contatar suporte
          </button>
        </div>
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Sair
        </button>
      </div>
      {supportOpen ? <CrmModal title="Contatar suporte" description="Este formulario registra apenas um pedido mockado enquanto nao ha backend." onClose={() => setSupportOpen(false)}><form onSubmit={submitSupport} className="space-y-5"><CrmInput name="subject" label="Assunto" required /><CrmTextarea name="message" label="Como podemos ajudar?" rows={4} required /><div className="flex justify-end gap-3"><CrmButton variant="secondary" onClick={() => setSupportOpen(false)}>Cancelar</CrmButton><CrmButton type="submit">Enviar solicitacao</CrmButton></div></form></CrmModal> : null}
      {logoutOpen ? <CrmConfirmDialog title="Sair do CRM?" description="Este e um fluxo visual. Nenhuma sessao real sera encerrada." confirmLabel="Sair para o inicio" onConfirm={() => router.push("/inicio")} onClose={() => setLogoutOpen(false)} /> : null}
      {toast ? <CrmToast message={toast} /> : null}
    </aside>
  );
}
