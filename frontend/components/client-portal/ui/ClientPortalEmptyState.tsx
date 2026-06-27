import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ClientPortalEmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400"><Icon className="h-7 w-7" aria-hidden="true" /></span><h2 className="mt-5 font-bold text-slate-900">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}
