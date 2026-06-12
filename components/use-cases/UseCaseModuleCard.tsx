import { MoreVertical } from "lucide-react";
import type { UseCaseModule } from "../../content/use-cases";
import { UseCaseModuleIcon } from "./UseCaseModuleIcon";
import { MotionCard } from "../motion";

type UseCaseModuleCardProps = {
  module: UseCaseModule;
  onSelect: (module: UseCaseModule) => void;
};

export function UseCaseModuleCard({
  module,
  onSelect,
}: UseCaseModuleCardProps) {
  return (
    <MotionCard className="h-full">
    <button
      type="button"
      onClick={() => onSelect(module)}
      className="group relative w-full rounded-xl border border-slate-100 bg-white p-6 text-left shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
      aria-label={`Ler detalhes de ${module.title}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <UseCaseModuleIcon type={module.iconType} />

        <span className="text-slate-300 transition-colors group-hover:text-slate-500">
          <MoreVertical className="h-5 w-5" />
        </span>
      </div>

      <h3 className="mb-2 font-semibold text-slate-800 transition-colors group-hover:text-blue-500">
        {module.title}
      </h3>

      <p className="text-sm leading-relaxed text-slate-400">
        {module.description}
      </p>
    </button>
    </MotionCard>
  );
}
