"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/MockAuthProvider";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { siteRoutes } from "@/data/siteRoutes";
import { ClientPortalSidebar } from "./ClientPortalSidebar";
import { ClientPortalTopbar } from "./ClientPortalTopbar";

export function ClientPortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAuth();
  const [exitOpen, setExitOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace(siteRoutes.login);
  }, [isAuthenticated, loading, router]);

  async function handleLogout() {
    await logout();
    setExitOpen(false);
    router.push(siteRoutes.home);
  }

  if (loading || !isAuthenticated) {
    return <div className="grid min-h-screen place-items-center bg-[#F8F9FB] text-sm font-semibold text-slate-500">Validando sessao...</div>;
  }

  return <div className="min-h-screen bg-[#F8F9FB] text-slate-800"><ClientPortalSidebar onExit={() => setExitOpen(true)} /><div className="min-h-screen lg:pl-64"><ClientPortalTopbar onExit={() => setExitOpen(true)} /><main>{children}</main></div>{exitOpen ? <ClientPortalModal title="Sair do Portal do Cliente?" description="A sessao real sera encerrada no backend e voce voltara ao site." onClose={() => setExitOpen(false)} size="sm"><div className="flex justify-end gap-3"><ClientPortalButton variant="secondary" onClick={() => setExitOpen(false)}>Cancelar</ClientPortalButton><ClientPortalButton onClick={handleLogout}>Voltar ao site</ClientPortalButton></div></ClientPortalModal> : null}</div>;
}
