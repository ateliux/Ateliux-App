import Link from "next/link";
import { legalNavigation } from "../../data/legalNavigation";

type LegalTabsProps = {
  activeId: string;
};

export function LegalTabs({ activeId }: LegalTabsProps) {
  return (
    <nav
      className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-500"
      aria-label="Navegação legal"
    >
      {legalNavigation.map((item) => {
        const isActive = item.id === activeId;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`relative pb-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 ${
              isActive
                ? "font-semibold text-gray-900"
                : "hover:text-gray-900"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}

            {isActive ? (
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-900" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
