import type { ReactNode } from "react";
import { CrmShell } from "@/components/crm/layout/CrmShell";

export default function CrmAppLayout({ children }: { children: ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}
