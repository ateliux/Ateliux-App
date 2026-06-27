import type { ReactNode } from "react";
type MetricCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
};

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {typeof trend === "number" ? (
          <p className={`mt-2 text-xs font-medium ${trend > 0 ? "text-[#00B074]" : "text-red-500"}`}>
            {trend > 0 ? "+" : ""}
            {trend}% vs último mês
          </p>
        ) : null}
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F7F1] text-[#00B074]">
        {icon}
      </div>
    </div>
  );
}
