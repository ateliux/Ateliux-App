import { aboutContent } from "../../content/about";
import { MotionContainer, MotionItem } from "../motion";

export function AboutIntroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32">
      <div className="mb-24 max-w-5xl space-y-6">
        <span className="block text-sm font-semibold uppercase tracking-wider text-blue-600">
          {aboutContent.intro.badge}
        </span>

        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-zinc-900 md:text-5xl lg:text-[56px]">
          {aboutContent.intro.title.main}{" "}
          <span className="text-zinc-300 transition-colors duration-500 hover:text-zinc-400">
            {aboutContent.intro.title.highlight}
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-zinc-100 pt-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            {aboutContent.intro.gridTitle}
          </h2>
        </div>

        <MotionContainer className="grid grid-cols-1 gap-x-16 gap-y-12 lg:col-span-8 md:grid-cols-2">
          {aboutContent.intro.pillars.map((pillar) => (
            <MotionItem key={pillar.title} staggered>
            <article key={pillar.title} className="group space-y-3">
              <h3 className="text-lg font-bold text-zinc-900 transition-colors group-hover:text-blue-600">
                {pillar.title}
              </h3>

              <p className="text-sm font-normal leading-relaxed text-zinc-400">
                {pillar.description}
              </p>
            </article>
            </MotionItem>
          ))}
        </MotionContainer>
      </div>
    </section>
  );
}
