"use client";

import type { SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerContent } from "../../content/home";
import { legalNavigation, socialNavigation } from "../../data/navigation";
import { MotionItem } from "../motion";

type SocialIconProps = SVGProps<SVGSVGElement>;

function TwitterIcon(props: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2H21.5l-7.11 8.126L22.75 22h-6.545l-5.126-6.7L5.213 22H1.955l7.605-8.693L1.5 2h6.71l4.633 6.124L18.244 2Zm-1.142 17.91h1.804L7.23 3.98H5.292L17.102 19.91Z" />
    </svg>
  );
}

function InstagramIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon(props: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M4.983 3.5C4.983 4.88 3.864 6 2.5 6S0 4.88 0 3.5 1.119 1 2.5 1s2.483 1.12 2.483 2.5ZM.32 8.1h4.36V23H.32V8.1ZM7.45 8.1h4.18v2.035h.06c.582-1.103 2.004-2.267 4.125-2.267C20.23 7.868 21 10.776 21 14.555V23h-4.36v-7.49c0-1.785-.033-4.082-2.487-4.082-2.49 0-2.87 1.945-2.87 3.955V23H7.45V8.1Z" />
    </svg>
  );
}

const socialIconMap = {
  Twitter: TwitterIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
} as const;

type SocialIconName = keyof typeof socialIconMap;

export function Footer() {
  const pathname = usePathname();
  const isBlog = pathname?.startsWith("/blog") ?? false;

  const linkClassName = isBlog
    ? "text-zinc-500 hover:text-white focus-visible:ring-white focus-visible:ring-offset-black"
    : "text-gray-400 hover:text-black focus-visible:ring-black focus-visible:ring-offset-white";

  return (
    <footer
      className={`select-none border-t px-8 py-8 transition-colors ${
        isBlog
          ? "border-white/[0.08] bg-black text-zinc-400"
          : "border-gray-100 bg-white text-gray-400"
      }`}
    >
      <MotionItem
        direction="up"
        className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-[11px] md:flex-row ${
          isBlog ? "text-zinc-500" : "text-gray-400"
        }`}
      >
        <p>{footerContent.copyright}</p>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <nav
            className="flex flex-wrap items-center justify-center gap-4"
            aria-label="Links legais"
          >
            {legalNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${linkClassName}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="flex items-center gap-5" aria-label="Redes sociais">
            {socialNavigation.map((item) => {
              const Icon = socialIconMap[item.label as SocialIconName];

              if (!Icon) {
                return null;
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className={`transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${linkClassName}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </nav>
        </div>
      </MotionItem>
    </footer>
  );
}
