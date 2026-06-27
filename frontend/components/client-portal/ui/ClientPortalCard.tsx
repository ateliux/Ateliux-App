import type { HTMLAttributes, ReactNode } from "react";

export function ClientPortalCard({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${className}`} {...props}>{children}</div>;
}
