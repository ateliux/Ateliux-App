import type { ReactNode } from "react";
import { CrmSidebar } from "./CrmSidebar";
import { CrmTopbar } from "./CrmTopbar";

export function CrmShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800">
      <CrmSidebar />
      <div className="min-h-screen lg:pl-60">
        <CrmTopbar />
        <main>{children}</main>
      </div>
    </div>
  );
}

