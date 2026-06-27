import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const controlClass = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200";

export function CrmInput({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-sm font-medium text-slate-600">{label}<input className={`${controlClass} ${className}`} {...props} /></label>;
}

export function CrmTextarea({ label, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className="block text-sm font-medium text-slate-600">{label}<textarea className={`${controlClass} resize-none ${className}`} {...props} /></label>;
}

export function CrmSelect({ label, children, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <label className="block text-sm font-medium text-slate-600">{label}<select className={`${controlClass} ${className}`} {...props}>{children}</select></label>;
}
