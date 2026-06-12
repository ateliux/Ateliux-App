import { aboutContent } from "../../content/about";
import { MotionContainer, MotionItem } from "../motion";

export function AboutMetricsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32">
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-5">
          <div className="text-blue-600">
            <svg
              className="h-16 w-16 animate-spin [animation-duration:20s]"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="10"
              aria-hidden="true"
            >
              <line x1="50" y1="10" x2="50" y2="90" />
              <line x1="10" y1="50" x2="90" y2="50" />
              <line x1="22" y1="22" x2="78" y2="78" />
              <line x1="22" y1="88" x2="78" y2="12" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-blue-600 md:text-5xl">
            {aboutContent.metrics.title}
          </h2>
        </div>

        <div className="hidden h-full min-h-[300px] w-px bg-zinc-100 lg:col-span-1 lg:mx-auto lg:block" />

        <MotionContainer className="space-y-16 lg:col-span-6">
          {aboutContent.metrics.items.map((item, index) => (
            <MotionItem key={item.value} staggered>
            <article key={item.value} className="group space-y-4">
              <span className="block origin-left text-6xl font-black tracking-tighter text-zinc-950 transition-transform duration-300 group-hover:scale-105 md:text-[80px]">
                {item.value}
              </span>

              <p className="max-w-md text-sm font-light leading-relaxed text-zinc-400">
                {item.description}
              </p>

              {index < aboutContent.metrics.items.length - 1 ? (
                <div className="border-t border-zinc-100" />
              ) : null}
            </article>
            </MotionItem>
          ))}
        </MotionContainer>
      </div>
    </section>
  );
}
