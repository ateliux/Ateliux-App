"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/MockAuthProvider";
import { siteRoutes } from "@/data/siteRoutes";
import { ClientPortalSidebar } from "./ClientPortalSidebar";
import { ClientPortalTopbar } from "./ClientPortalTopbar";

export function ClientPortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace(siteRoutes.login);
  }, [isAuthenticated, loading, router]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace(siteRoutes.home);
      router.refresh();
    }
  }

  if (loading || !isAuthenticated) {
    return <div className="grid min-h-screen place-items-center bg-[#F8F9FB] text-sm font-semibold text-slate-500">Validando sessao...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800">
      <ClientPortalSidebar onExit={handleLogout} />
      <div className="min-h-screen lg:pl-64">
        <ClientPortalTopbar onExit={handleLogout} />
        <main>{children}</main>
      </div>
    </div>
  );
}
