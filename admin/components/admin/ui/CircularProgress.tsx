type CircularProgressProps = {
  value: number;
  max: number;
  label?: string;
  colorClass: string;
  size?: "normal" | "large";
};

export function CircularProgress({ value, max, label, colorClass, size = "normal" }: CircularProgressProps) {
  const radius = size === "large" ? 40 : 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / max) * circumference;
  const svgSize = size === "large" ? "h-28 w-28" : "h-20 w-20";

  return (
    <div className="relative flex w-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {label ? <h4 className="mb-4 text-xs font-semibold text-gray-500">{label}</h4> : null}

      <div className="relative flex items-center justify-center">
        <svg className={`-rotate-90 ${svgSize}`} viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} stroke="#F1F5F9" strokeWidth={size === "large" ? 8 : 6} fill="transparent" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={size === "large" ? 8 : 6}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-in-out ${colorClass}`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className={`${size === "large" ? "text-2xl" : "text-lg"} font-bold leading-none text-gray-800`}>
            {size === "large" ? `${Math.round((value / max) * 100)}%` : value}
          </span>
          {size !== "large" ? <span className="text-[10px] text-gray-400">/{max}</span> : null}
        </div>
      </div>
    </div>
  );
}
