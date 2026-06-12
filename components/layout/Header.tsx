"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerContent } from "../../content/home";
import { mainNavigation } from "../../data/navigation";
import { siteRoutes } from "../../data/siteRoutes";
import { Logo } from "../ui/Logo";
import { MotionItem, MotionLink } from "../motion";

export function Header() {
  const pathname = usePathname();
  const isBlog = pathname?.startsWith("/blog") ?? false;

  return (
    <header
      className={`border-b px-8 py-6 transition-colors ${
        isBlog
          ? "border-white/[0.08] bg-black text-white"
          : "border-transparent bg-white text-slate-900"
      }`}
    >
      <MotionItem direction="down" amount={0.05} className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href={siteRoutes.home}
          aria-label="Ir para o início"
          className="flex items-center gap-2"
        >
          <Logo
            src={headerContent.logo.src}
            alt={headerContent.logo.alt}
            priority
            className={`h-7 w-auto transition-all ${
              isBlog ? "brightness-0 invert" : ""
            }`}
          />
        </Link>

        <div className="flex items-center gap-6">
          <nav
            className={`hidden items-center gap-6 text-sm font-medium md:flex ${
              isBlog ? "text-zinc-400" : "text-gray-500"
            }`}
            aria-label="Navegação principal"
          >
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${
                  isBlog
                    ? "hover:text-white focus-visible:ring-white focus-visible:ring-offset-black"
                    : "hover:text-black focus-visible:ring-black focus-visible:ring-offset-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <MotionLink
              href={headerContent.login.href}
              className={`hidden rounded-lg px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 sm:inline-flex ${
                isBlog
                  ? "text-zinc-400 hover:text-white focus-visible:ring-white focus-visible:ring-offset-black"
                  : "text-gray-600 hover:text-black focus-visible:ring-black focus-visible:ring-offset-white"
              }`}
            >
              {headerContent.login.label}
            </MotionLink>

            <MotionLink
              href={headerContent.cta.href}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${
                isBlog
                  ? "bg-white text-black hover:bg-zinc-200 focus-visible:ring-white focus-visible:ring-offset-black"
                  : "bg-black text-white hover:bg-gray-800 focus-visible:ring-black focus-visible:ring-offset-white"
              }`}
            >
              {headerContent.cta.label}
            </MotionLink>
          </div>
        </div>
      </MotionItem>
    </header>
  );
}
