import {
  type BillingCycleId,
  type PricingPlan,
} from "../../content/pricing";
import { MotionCard, MotionLink } from "../motion";

type PricingPlanCardProps = {
  plan: PricingPlan;
  billingCycle: BillingCycleId;
};

export function PricingPlanCard({
  plan,
  billingCycle,
}: PricingPlanCardProps) {
  const price = plan.pricing[billingCycle];

  return (
    <MotionCard className="h-full">
    <article className="flex h-full min-h-[340px] flex-col justify-between bg-[#f8fafc] p-8">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-950">
              {plan.name}
            </h3>

            <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-gray-400">
              {plan.description}
            </p>
          </div>

          {plan.recommended ? (
            <span className="border border-gray-200 bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
              Popular
            </span>
          ) : null}
        </div>

        <div className="mt-9 flex items-end text-gray-950">
          <span className="text-4xl font-bold tracking-tight">
            {price.value}
          </span>

          {price.period ? (
            <span className="ml-1 pb-1 text-sm font-normal text-gray-400">
              {price.period}
            </span>
          ) : null}
        </div>

        {price.detail ? (
          <p className="mt-2 text-xs leading-relaxed text-gray-400">
            {price.detail}
          </p>
        ) : null}

        <ul className="mt-8 space-y-3">
          {plan.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex gap-3 text-xs leading-relaxed text-gray-500">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#118a5a]/20 bg-[#118a5a]/10 text-[#118a5a]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="h-2.5 w-2.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <MotionLink
        href={plan.cta.href}
        className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
      >
        {plan.cta.label}
      </MotionLink>
    </article>
    </MotionCard>
  );
}
