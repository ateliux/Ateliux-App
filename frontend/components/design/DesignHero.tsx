import { designContent } from "../../content/design";

export function DesignHero() {
  return (
    <section className="mx-auto mb-24 flex max-w-3xl flex-col items-center text-center">
      <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-500">
        {designContent.hero.badge}
      </span>

      <h1 className="mb-6 text-4xl font-bold text-slate-900">
        {designContent.hero.title}
      </h1>

      <p className="text-sm leading-relaxed text-slate-500">
        {designContent.hero.description}
      </p>
    </section>
  );
}
