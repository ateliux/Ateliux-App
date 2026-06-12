import { Code, MessageSquare, Upload } from "lucide-react";
import { meetContent } from "../../content/home";
import { FeatureCard } from "../ui/FeatureCard";

const iconMap = {
  code: Code,
  upload: Upload,
  message: MessageSquare,
} as const;

export function MeetMousebackSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-16 pt-24 text-center" aria-labelledby="meet-title">
      <h2 id="meet-title" className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
        {meetContent.title}
      </h2>
      <p className="mx-auto mb-2 max-w-2xl text-gray-500">
        {meetContent.paragraphs[0]}
      </p>
      <p className="mx-auto mb-16 max-w-2xl text-gray-500">
        {meetContent.paragraphs[1]}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {meetContent.steps.map((step) => (
          <FeatureCard
            key={step.title}
            icon={iconMap[step.icon]}
            title={step.title}
            description={step.description}
            iconContainerClass={step.iconContainerClass}
            iconClass={step.iconClass}
          />
        ))}
      </div>
    </section>
  );
}
