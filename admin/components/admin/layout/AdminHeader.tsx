"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/admin/ui/Avatar";
import type { AdminAuthSession } from "@/services/admin-auth.service";

type AdminHeaderProps = {
  title: string;
  onOpenSidebar: () => void;
  session: AdminAuthSession;
  onLogout: () => void;
};

export function AdminHeader({ title, onOpenSidebar, session, onLogout }: AdminHeaderProps) {
  const router = useRouter();
  const adminName = session.user.name || "Admin Ateliux";
  const adminRole = session.user.adminRole ?? session.admin?.role ?? "Administrador";
  const avatarUrl = session.admin?.avatarUrl ?? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button type="button" className="rounded-lg bg-gray-50 p-2 text-gray-600 lg:hidden" onClick={onOpenSidebar} aria-label="Abrir menu lateral">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="hidden text-lg font-bold text-gray-800 md:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="relative hidden items-center md:flex">
          <Search className="absolute left-4 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-64 rounded-full border border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#00B074]/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push("/dashboard?view=inbox")} className="relative rounded-full p-2.5 text-gray-400 transition-colors hover:bg-gray-50" aria-label="Abrir notificacoes">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          <div className="mx-2 hidden h-8 w-px bg-gray-200 sm:block" />

          <button type="button" onClick={onLogout} className="flex items-center gap-3 rounded-full p-1.5 pr-4 transition-colors hover:bg-gray-50" aria-label="Sair da admin">
            <Avatar src={avatarUrl} size="h-9 w-9" alt={adminName} />
            <div className="hidden text-left lg:block">
              <p className="text-sm font-bold leading-none text-gray-800">{adminName}</p>
              <p className="mt-1 text-[11px] text-gray-500">{adminRole}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
