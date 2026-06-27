import type { ReactNode } from "react";

export function ClientPortalPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow ? <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p> : null}<h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>{description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}</div>{actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}</div>;
}
