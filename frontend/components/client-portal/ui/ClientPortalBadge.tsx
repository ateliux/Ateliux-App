import type { ReactNode } from "react";
import type { ClientPortalBadgeVariant } from "@/types/client-portal";

const classes: Record<ClientPortalBadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-zinc-900 text-white",
};

export function ClientPortalBadge({ children, variant = "neutral" }: { children: ReactNode; variant?: ClientPortalBadgeVariant }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[variant]}`}>{children}</span>;
}
