import type { LucideIcon } from "lucide-react";
import { MotionCard } from "../motion";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconContainerClass?: string;
  iconClass?: string;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconContainerClass = "bg-gray-50",
  iconClass = "text-gray-900",
}: FeatureCardProps) {
  return (
    <MotionCard className="h-full">
    <article className="h-full rounded-[2rem] border border-gray-50 bg-white p-8 text-left shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)]">
      <div
        className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${iconContainerClass}`}
      >
        <Icon className={`h-5 w-5 ${iconClass}`} />
      </div>
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </article>
    </MotionCard>
  );
}
