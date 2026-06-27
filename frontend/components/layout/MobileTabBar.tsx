"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavigation } from "@/data/mobileNavigation";
import { siteRoutes } from "@/data/siteRoutes";

const hiddenRoutes = [siteRoutes.login, siteRoutes.register, "/crm", "/cliente"];

function isExactOrNestedRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isHomeActive(pathname: string) {
  return pathname === "/" || pathname === siteRoutes.home;
}

function isActiveRoute(pathname: string, href: string) {
  if (href === siteRoutes.home) {
    return isHomeActive(pathname);
  }

  return isExactOrNestedRoute(pathname, href);
}

function isHiddenRoute(pathname: string) {
  return hiddenRoutes.some((route) => isExactOrNestedRoute(pathname, route));
}

export function MobileTabBar() {
  const pathname = usePathname() ?? "/";

  if (isHiddenRoute(pathname)) {
    return null;
  }

  const isBlogTheme = isExactOrNestedRoute(pathname, siteRoutes.blog);

  const barClassName = isBlogTheme
    ? "border-white/10 bg-[#09090B]/95 text-zinc-500 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
    : "border-slate-200/70 bg-white/95 text-slate-400 shadow-[0_10px_30px_rgba(15,23,42,0.1)]";

  const activeItemClassName = isBlogTheme
    ? "text-white"
    : "text-black";

  const inactiveItemClassName = isBlogTheme
    ? "hover:text-zinc-200"
    : "hover:text-slate-700";

  return (
    <nav
      aria-label="Navegação mobile principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className={`pointer-events-auto mx-auto mb-3 grid h-[58px] w-[calc(100%-32px)] max-w-[430px] grid-cols-5 rounded-2xl border px-3 backdrop-blur-xl ${barClassName}`}
      >
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center text-[8px] leading-none transition-colors duration-200 ease-out focus:outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isBlogTheme
                  ? "focus-visible:ring-white focus-visible:ring-offset-black"
                  : "focus-visible:ring-black focus-visible:ring-offset-white"
              } ${isActive ? activeItemClassName : inactiveItemClassName}`}
            >
              <span
                aria-hidden="true"
                className={`absolute bottom-1.5 h-0.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? isBlogTheme
                      ? "w-3.5 bg-white/90 opacity-100"
                      : "w-3.5 bg-black/90 opacity-100"
                    : "w-0 opacity-0"
                }`}
              />
              <Icon
                aria-hidden="true"
                className={`h-[17px] w-[17px] transition-transform duration-200 ease-out ${
                  isActive ? "scale-[1.02]" : ""
                }`}
                strokeWidth={isActive ? 1.85 : 1.6}
              />
              <span
                className={`whitespace-nowrap ${
                  isActive ? "font-medium" : "font-normal"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
