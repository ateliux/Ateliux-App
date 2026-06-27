import type { ReactNode } from "react";
import type { BadgeVariant } from "@/types/admin";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const badgeClassName: Record<BadgeVariant, string> = {
  green: "border-[#A7F3D0] bg-[#E6F7F1] text-[#00B074]",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-600",
  red: "border-red-200 bg-red-50 text-red-600",
  gray: "border-gray-200 bg-gray-100 text-gray-600",
  blue: "border-blue-200 bg-blue-50 text-blue-600"
};

export function Badge({ children, variant = "gray" }: BadgeProps) {
  return (
    <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${badgeClassName[variant]}`}>
      {children}
    </span>
  );
}
