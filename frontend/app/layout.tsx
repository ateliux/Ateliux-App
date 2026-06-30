import type { Metadata } from "next";
import "./globals.css";
import { MockAuthProvider } from "../components/auth/MockAuthProvider";
import { SiteShell } from "../components/layout/SiteShell";
import { CookieConsentBanner } from "../components/privacy/CookieConsentBanner";

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
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-black selection:text-white">
        <MockAuthProvider>
          <SiteShell>{children}</SiteShell>
          <CookieConsentBanner />
        </MockAuthProvider>
      </body>
    </html>
  );
}
