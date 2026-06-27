import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  name?: string;
  size?: string;
  alt?: string;
};

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "A";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export function Avatar({ src, name, size = "h-10 w-10", alt = "Avatar" }: AvatarProps) {
  if (!src) {
    return (
      <div className={`${size} flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#E6F7F1] text-xs font-bold text-[#00B074] shadow-sm`} aria-label={alt}>
        {getInitials(name ?? alt)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || name || "Avatar"}
      width={150}
      height={150}
      className={`${size} shrink-0 rounded-full border-2 border-white object-cover shadow-sm`}
    />
  );
}
