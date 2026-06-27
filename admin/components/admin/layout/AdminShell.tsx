"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminTheme } from "@/data/admin/admin-theme";
import { getAdminSession, logoutAdmin, type AdminAuthSession } from "@/services/admin-auth.service";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
  title: string;
  children: ReactNode;
};

export function AdminShell({ title, children }: AdminShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((nextSession) => {
        if (!active) return;
        setSession(nextSession);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setSession(null);
        setError(requestError instanceof Error ? requestError.message : "Sessao administrativa invalida.");
        router.replace("/");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    await logoutAdmin().catch(() => undefined);
    setSession(null);
    router.push("/");
  }

  if (loading || !session) {
    return (
      <div className={`grid min-h-screen place-items-center ${adminTheme.bgBase} text-sm font-semibold text-gray-500`}>
        {error || "Validando sessao administrativa..."}
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen text-gray-800 ${adminTheme.bgBase} font-sans`}>
      <Suspense fallback={<aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white lg:block" />}>
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>

      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu lateral"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader title={title} onOpenSidebar={() => setSidebarOpen(true)} session={session} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto bg-[#F4F7F6] p-4 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
