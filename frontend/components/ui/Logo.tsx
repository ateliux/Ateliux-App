import Image from "next/image";

type LogoProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function Logo({ src, alt, className = "h-7 w-auto", priority = false }: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={160}
      height={48}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
