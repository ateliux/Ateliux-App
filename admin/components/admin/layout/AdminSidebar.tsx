"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import { adminNavigation } from "@/data/admin/admin-navigation";
import type { AdminNavigationItem } from "@/types/admin";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function isItemActive(pathname: string, currentHref: string, item: AdminNavigationItem) {
  if (item.href.includes("?")) return currentHref === item.href;
  if (item.href === "/dashboard") return currentHref === "/dashboard";
  if (item.href === "/portal-do-cliente/arquivos") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPortalOpen, setPortalOpen] = useState(() => pathname.startsWith("/portal-do-cliente"));

  const navigation = useMemo(() => adminNavigation, []);
  const currentHref = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-6">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00B074] text-xl font-bold text-white">A</div>
          <span className="text-xl font-bold tracking-tight text-gray-800">Ateliux</span>
        </Link>

        <button type="button" className="text-gray-500 lg:hidden" onClick={onClose} aria-label="Fechar menu lateral">
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4" aria-label="Navegação administrativa">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(pathname, currentHref, item) || Boolean(item.children?.some((child) => isItemActive(pathname, currentHref, child)));

          if (item.children?.length) {
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => setPortalOpen((current) => !current)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active ? "bg-[#00B074] text-white shadow-md shadow-emerald-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isPortalOpen ? "rotate-180" : ""}`} />
                </button>

                {isPortalOpen ? (
                  <div className="mt-2 space-y-1 rounded-2xl bg-gray-50 p-2">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isItemActive(pathname, currentHref, child);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                            childActive ? "bg-white text-[#00B074] shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-900"
                          }`}
                        >
                          <ChildIcon className="h-4 w-4" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active ? "bg-[#00B074] text-white shadow-md shadow-emerald-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
