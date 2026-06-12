import { pricingContent } from "../../content/pricing";

export function PricingHero() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="mb-6 flex items-center justify-center">
        <span className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 shadow-sm">
          {pricingContent.hero.badge}
        </span>
      </div>

      <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
        {pricingContent.hero.title}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg">
        {pricingContent.hero.description}
      </p>
    </div>
  );
}