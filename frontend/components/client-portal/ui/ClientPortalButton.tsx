import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-black text-white hover:bg-zinc-800",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-black",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

export function ClientPortalButton({ children, variant = "primary", type = "button", className = "", ...props }: Props) {
  return <button type={type} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
