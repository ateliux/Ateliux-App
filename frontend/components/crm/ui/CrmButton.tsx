import type { ButtonHTMLAttributes, ReactNode } from "react";

type CrmButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-black text-white shadow-sm shadow-gray-200 hover:bg-gray-800",
  secondary: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
};

export function CrmButton({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: CrmButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
