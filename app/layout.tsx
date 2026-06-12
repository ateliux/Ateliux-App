import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "../components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Ateliux — Software sob medida",
  description:
    "A Ateliux cria sites, landing pages, e-commerce, SaaS, dashboards e ecossistemas digitais sob medida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-black selection:text-white">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
