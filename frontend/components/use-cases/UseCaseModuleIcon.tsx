import type { UseCaseModuleIconType } from "../../content/use-cases";

type UseCaseModuleIconProps = {
  type: UseCaseModuleIconType;
};

export function UseCaseModuleIcon({ type }: UseCaseModuleIconProps) {
  const colorMap = {
    blue: { bg: "bg-blue-50", stroke: "#3b82f6" },
    green: { bg: "bg-emerald-50", stroke: "#10b981" },
    pink: { bg: "bg-pink-50", stroke: "#ec4899" },
  } as const;

  const colors = colorMap[type];

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bg}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {type === "blue" ? (
          <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </>
        ) : null}

        {type === "green" ? (
          <>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </>
        ) : null}

        {type === "pink" ? (
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        ) : null}
      </svg>
    </div>
  );
}