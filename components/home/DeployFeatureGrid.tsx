import { backendBrowserContent } from "../../content/home";
import { MotionContainer, MotionItem } from "../motion";

type DeployFeature = (typeof backendBrowserContent.deploy.features)[number];

type DeployIconProps = {
  icon: DeployFeature["icon"];
};

function DeployIcon({ icon }: DeployIconProps) {
  if (icon === "simple") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" className="text-black" aria-hidden="true">
        <circle cx="12" cy="12" r="6" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "secure") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" className="text-black" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="5" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "scalable") {
    return (
      <svg width="42" height="24" viewBox="0 0 42 24" fill="none" className="text-black" aria-hidden="true">
        <circle cx="6" cy="12" r="3" fill="currentColor" />
        <circle cx="18" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="34" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (icon === "runnable") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinejoin="round" className="text-black" aria-hidden="true">
        <polygon points="6 3 20 12 6 21 6 3" />
      </svg>
    );
  }

  if (icon === "debuggable") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" className="text-black" aria-hidden="true">
        <rect x="9" y="6" width="6" height="12" rx="3" fill="currentColor" />
        <circle cx="12" cy="4" r="1.5" fill="currentColor" />
        <path d="M10 3.5c-1-1-2-1-2-.5M14 3.5c1-1 2-1 2-.5" />
        <path d="M6 8h3M15 8h3M5 12h4M15 12h4M6 16h3M15 16h3" />
      </svg>
    );
  }

  return (
    <svg width="26" height="26" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" className="text-black" aria-hidden="true">
      <path d="M21.5 2v6h-6" />
      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function DeployFeatureCard({ feature, index }: { feature: DeployFeature; index: number }) {
  const isMiddleColumn = index % 3 === 1;

  return (
    <article
      className={`flex flex-col items-center border-b border-gray-100 p-10 text-center md:border-b-0 ${
        isMiddleColumn ? "md:border-l md:border-r" : ""
      }`}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center">
        <DeployIcon icon={feature.icon} />
      </div>
      <h4 className="mb-2 text-sm font-bold text-gray-900">{feature.title}</h4>
      <p className="max-w-[200px] text-xs leading-relaxed text-gray-500">
        {feature.description}
      </p>
    </article>
  );
}

export function DeployFeatureGrid() {
  const firstRow = backendBrowserContent.deploy.features.slice(0, 3);
  const secondRow = backendBrowserContent.deploy.features.slice(3);

  return (
    <div className="relative z-10 mx-auto mb-32 max-w-5xl border-b border-t border-gray-100 bg-white">
      <div className="py-16 text-center">
        <h3 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {backendBrowserContent.deploy.title}
        </h3>
        <p className="text-sm text-gray-500 md:text-base">
          {backendBrowserContent.deploy.description}
        </p>
      </div>

      <MotionContainer className="grid grid-cols-1 border-t border-gray-100 md:grid-cols-3">
        {firstRow.map((feature, index) => (
          <MotionItem key={feature.title} staggered>
          <DeployFeatureCard key={feature.title} feature={feature} index={index} />
          </MotionItem>
        ))}
      </MotionContainer>

      <MotionContainer className="grid grid-cols-1 border-t border-gray-100 md:grid-cols-3">
        {secondRow.map((feature, index) => (
          <MotionItem key={feature.title} staggered>
          <DeployFeatureCard key={feature.title} feature={feature} index={index} />
          </MotionItem>
        ))}
      </MotionContainer>
    </div>
  );
}
