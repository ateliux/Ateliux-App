"use client";

import { useState } from "react";
import {
  pricingContent,
  type BillingCycleId,
} from "../../content/pricing";
import { BillingToggle } from "./BillingToggle";
import { PricingComparisonTable } from "./PricingComparisonTable";
import { PricingFaq } from "./PricingFaq";
import { PricingPlanCard } from "./PricingPlanCard";
import { MotionContainer, MotionItem } from "../motion";

export function PricingClientSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycleId>("monthly");

  return (
    <div className="mx-auto mt-16 max-w-7xl">
      <MotionContainer className="grid gap-8 lg:grid-cols-4 lg:items-stretch">
        <MotionItem staggered>
        <aside className="pt-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-950">
            {pricingContent.selector.title}
          </h2>

          <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-gray-500">
            {pricingContent.selector.description}
          </p>

          <BillingToggle value={billingCycle} onChange={setBillingCycle} />
        </aside>
        </MotionItem>

        {pricingContent.plans.map((plan) => (
          <MotionItem key={plan.id} staggered className="h-full">
          <PricingPlanCard
            plan={plan}
            billingCycle={billingCycle}
          />
          </MotionItem>
        ))}
      </MotionContainer>

      <PricingFaq />

      <PricingComparisonTable billingCycle={billingCycle} />
    </div>
  );
}
