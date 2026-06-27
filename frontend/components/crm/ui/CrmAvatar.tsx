import Image from "next/image";

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
} as const;

type CrmAvatarProps = {
  src: string;
  alt: string;
  size?: keyof typeof avatarSizes;
  className?: string;
};

export function CrmAvatar({ src, alt, size = "md", className = "" }: CrmAvatarProps) {
  const dimension = avatarSizes[size];

  return (
    <Image
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      style={{ width: dimension, height: dimension }}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
