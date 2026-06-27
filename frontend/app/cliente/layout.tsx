import type { ReactNode } from "react";
import { ClientPortalShell } from "@/components/client-portal/layout/ClientPortalShell";

// TODO: proteger esta area quando a autenticacao real for implementada.
export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  return <ClientPortalShell>{children}</ClientPortalShell>;
}
