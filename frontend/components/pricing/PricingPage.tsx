import { PricingClientSection } from "./PricingClientSection";
import { PricingHero } from "./PricingHero";
import { MotionItem } from "../motion";

export function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] border-b border-gray-100 bg-white" />

        <div className="relative z-10">
          <MotionItem><PricingHero /></MotionItem>
          <MotionItem><PricingClientSection /></MotionItem>
        </div>
      </section>
    </main>
  );
}
