import {
  pricingContent,
  type BillingCycleId,
} from "../../content/pricing";
import { ComparisonValue } from "./ComparisonValue";
import { MotionSection } from "../motion";

type PricingComparisonTableProps = {
  billingCycle: BillingCycleId;
};

export function PricingComparisonTable({
  billingCycle,
}: PricingComparisonTableProps) {
  return (
    <MotionSection className="mt-16">
      <div className="mb-10 grid gap-8 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
            {pricingContent.comparison.eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
            {pricingContent.comparison.title}
          </h2>

          <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-gray-500">
            {pricingContent.comparison.description}
          </p>
        </div>

        {pricingContent.plans.map((plan) => (
          <div key={plan.id} className="bg-[#f8fafc] px-8 py-6">
            <p className="text-sm font-bold text-gray-950">{plan.name}</p>
            <p className="mt-1 text-xs text-gray-400">
              {plan.pricing[billingCycle].value}
              {plan.pricing[billingCycle].period}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          {pricingContent.comparison.features.map((feature) => (
            <div
              key={feature.name}
              className="grid grid-cols-4 gap-8 border-b border-gray-100 py-5"
            >
              <div className="pr-4 text-sm font-semibold text-gray-900">
                {feature.name}
              </div>

              {pricingContent.plans.map((plan) => (
                <div key={plan.id} className="bg-[#f8fafc] px-8 py-4">
                  <ComparisonValue value={feature.values[plan.id]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
