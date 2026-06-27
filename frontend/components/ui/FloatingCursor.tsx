import type { CSSProperties } from "react";

type FloatingCursorProps = {
  color: string;
  label: string;
  top: string;
  left: string;
  mobileTop?: string;
  mobileLeft?: string;
  rotate?: string;
};

export function FloatingCursor({
  color,
  label,
  top,
  left,
  mobileTop = top,
  mobileLeft = left,
  rotate = "-rotate-12",
}: FloatingCursorProps) {
  return (
    <div
      className="pointer-events-none absolute left-[var(--cursor-mobile-left)] top-[var(--cursor-mobile-top)] z-30 flex origin-top-left scale-[0.82] items-start gap-1 sm:left-[var(--cursor-left)] sm:top-[var(--cursor-top)] sm:scale-100"
      style={
        {
          "--cursor-left": left,
          "--cursor-top": top,
          "--cursor-mobile-left": mobileLeft,
          "--cursor-mobile-top": mobileTop,
        } as CSSProperties
      }
      aria-hidden="true"
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
