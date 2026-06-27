"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";

const fullAppRoutes = ["/login", "/criar-conta", "/crm", "/cliente"];

function isExactOrNestedRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPathname = pathname ?? "/";
  const isFullAppRoute = fullAppRoutes.some((route) =>
    isExactOrNestedRoute(currentPathname, route),
  );
  const isDarkRoute = isExactOrNestedRoute(currentPathname, "/blog");

  if (isFullAppRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className={`pb-24 md:pb-0 ${isDarkRoute ? "bg-black" : "bg-white"}`}>
        {children}
        <Footer />
      </div>
      <MobileTabBar />
    </>
  );
}
