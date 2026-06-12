type ComparisonValueProps = {
  value: string | boolean;
};

export function ComparisonValue({ value }: ComparisonValueProps) {
  if (typeof value === "boolean") {
    return (
      <div className="flex h-full items-center">
        {value ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#118a5a]/20 bg-[#118a5a]/10 text-[#118a5a]">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-400">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </div>
    );
  }

  return <span className="text-sm font-normal text-gray-600">{value}</span>;
}