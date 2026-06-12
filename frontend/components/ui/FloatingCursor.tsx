type FloatingCursorProps = {
  color: string;
  label: string;
  top: string;
  left: string;
  rotate?: string;
};

export function FloatingCursor({
  color,
  label,
  top,
  left,
  rotate = "-rotate-12",
}: FloatingCursorProps) {
  return (
    <div
      className="pointer-events-none absolute z-10 flex items-start gap-1"
      style={{ top, left }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={color}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`relative mt-1 ${rotate}`}
        aria-hidden="true"
      >
        <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
      </svg>
      <div
        className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    </div>
  );
}
