import type { AboutServiceIconName } from "../../content/about";

type AboutServiceIconProps = {
  icon: AboutServiceIconName;
  featured?: boolean;
};

export function AboutServiceIcon({
  icon,
  featured = false,
}: AboutServiceIconProps) {
  const className = featured ? "h-10 w-10 text-white" : "h-10 w-10 text-blue-500";

  if (icon === "layers") {
    return (
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M50,15 L85,30 L50,45 L15,30 Z" />
        <path d="M15,48 L50,63 L85,48" strokeWidth="2" className="opacity-80" />
        <path d="M15,66 L50,81 L85,66" strokeWidth="2" className="opacity-60" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polygon points="35,30 15,70 55,70" strokeWidth="1.5" />
      <polygon points="65,30 45,70 85,70" strokeWidth="1.5" />
      <polygon points="50,15 30,55 70,55" strokeWidth="1.5" className="opacity-80" />
    </svg>
  );
}