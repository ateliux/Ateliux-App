import { ArrowLeft, Layers } from "lucide-react";
import { authContent } from "../../content/auth";

export function AuthBrandPanel() {
  return (
    <aside className="relative z-10 flex h-full w-full flex-col justify-between border-b border-[#262729] p-8 md:min-h-screen md:border-b-0 md:border-r md:p-14 lg:p-16">
      <div>
        <a
          href="/inicio"
          className="inline-flex items-center text-xs text-[#888888] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#121214]"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          {authContent.brand.backLabel}
        </a>
      </div>

      <div className="mt-24 md:mt-0">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center justify-center bg-white p-1.5 text-black">
            <Layers className="h-5 w-5" />
          </div>

          <span className="text-lg font-semibold tracking-wide text-white">
            {authContent.brand.name}
          </span>
        </div>

        <p className="mb-16 max-w-sm text-[13px] leading-[1.6] text-[#888888]">
          {authContent.brand.description}
        </p>

        <nav
          className="flex items-center gap-6 text-[13px] text-[#888888]"
          aria-label="Links institucionais"
        >
          {authContent.brand.links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#121214]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
