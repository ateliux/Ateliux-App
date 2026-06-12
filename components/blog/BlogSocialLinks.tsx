import { blogContent } from "../../content/blog";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.11 8.126L22.75 22h-6.545l-5.126-6.7L5.213 22H1.955l7.605-8.693L1.5 2h6.71l4.633 6.124L18.244 2Zm-1.142 17.91h1.804L7.23 3.98H5.292L17.102 19.91Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M4.983 3.5C4.983 4.88 3.864 6 2.5 6S0 4.88 0 3.5 1.119 1 2.5 1s2.483 1.12 2.483 2.5ZM.32 8.1h4.36V23H.32V8.1ZM7.45 8.1h4.18v2.035h.06c.582-1.103 2.004-2.267 4.125-2.267C20.23 7.868 21 10.776 21 14.555V23h-4.36v-7.49c0-1.785-.033-4.082-2.487-4.082-2.49 0-2.87 1.945-2.87 3.955V23H7.45V8.1Z" />
    </svg>
  );
}

const iconMap = {
  x: XIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
} as const;

export function BlogSocialLinks() {
  return (
    <nav className="flex gap-4 pt-1" aria-label="Redes sociais do blog">
      {blogContent.social.links.map((item) => {
        const Icon = iconMap[item.icon];

        return (
          <a
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className="text-white transition-colors hover:text-zinc-400"
          >
            <Icon />
          </a>
        );
      })}
    </nav>
  );
}