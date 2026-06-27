import type { ReactNode } from "react";
import type { CrmBadgeVariant } from "@/types/crm";

const variantClasses: Record<CrmBadgeVariant, string> = {
  blue: "bg-slate-100 text-slate-800",
  green: "bg-emerald-50 text-emerald-600",
  gray: "bg-slate-100 text-slate-600",
  red: "bg-rose-50 text-rose-600",
  yellow: "bg-amber-50 text-amber-600",
};

export function CrmBadge({
  children,
  variant = "gray",
}: {
  children: ReactNode;
  variant?: CrmBadgeVariant;
}) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
