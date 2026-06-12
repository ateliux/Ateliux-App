import {
  pricingContent,
  type BillingCycleId,
} from "../../content/pricing";
import { MotionButton } from "../motion";

type BillingToggleProps = {
  value: BillingCycleId;
  onChange: (value: BillingCycleId) => void;
};

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="mt-10 space-y-4">
      {pricingContent.billingCycles.map((cycle) => (
        <MotionButton
          key={cycle.id}
          type="button"
          onClick={() => onChange(cycle.id)}
          className="group flex w-full max-w-[260px] items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
              value === cycle.id
                ? "border-black"
                : "border-gray-300 bg-white"
            }`}
          >
            {value === cycle.id ? (
              <span className="h-2 w-2 rounded-full bg-black" />
            ) : null}
          </span>

          <span
            className={`text-sm font-medium transition-colors ${
              value === cycle.id
                ? "text-black"
                : "text-gray-400 group-hover:text-gray-600"
            }`}
          >
            {cycle.label}
          </span>

          {"badge" in cycle ? (
            <span className="border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-500">
              {cycle.badge}
            </span>
          ) : null}
        </MotionButton>
      ))}
    </div>
  );
}
