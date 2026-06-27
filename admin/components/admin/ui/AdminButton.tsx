import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variantClassName = {
  primary: "bg-[#00B074] text-white hover:bg-[#009662] shadow-sm shadow-emerald-100",
  secondary: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
} as const;

export function AdminButton({ children, variant = "primary", className = "", ...props }: AdminButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClassName[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
