import { useState } from "react";
import type { UseCaseModule } from "../../content/use-cases";
import { UseCaseModuleCard } from "./UseCaseModuleCard";
import { UseCaseModuleDetail } from "./UseCaseModuleDetail";
import { MotionButton, MotionContainer, MotionItem } from "../motion";

type UseCasesModulesGridProps = {
  activeCategoryLabel: string;
  modules: readonly UseCaseModule[];
  selectedModule: UseCaseModule | null;
  onSelectModule: (module: UseCaseModule) => void;
  onBackToModules: () => void;
};

export function UseCasesModulesGrid({
  activeCategoryLabel,
  modules,
  selectedModule,
  onSelectModule,
  onBackToModules,
}: UseCasesModulesGridProps) {
  const [visibleCount, setVisibleCount] = useState(3);

  const visibleModules = modules.slice(0, visibleCount);

  return (
    <section className="flex-1">
      <h2 className="mb-8 flex items-center text-xl font-medium text-slate-600">
        Módulos populares para{" "}
        <span className="ml-1 font-bold text-blue-500">
          “{activeCategoryLabel}”
        </span>
      </h2>

      {selectedModule ? (
        <MotionItem>
        <UseCaseModuleDetail
          module={selectedModule}
          onBack={onBackToModules}
        />
        </MotionItem>
      ) : (
        <>
          <MotionContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleModules.map((module) => (
              <MotionItem key={module.id} staggered className="h-full">
              <UseCaseModuleCard
                module={module}
                onSelect={onSelectModule}
              />
              </MotionItem>
            ))}
          </MotionContainer>

          {modules.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              Nenhum módulo encontrado para esta busca.
            </p>
          ) : null}

          {modules.length > 3 ? (
            <div className="mt-12 flex justify-center">
              <MotionButton
                type="button"
                onClick={() =>
                  setVisibleCount((current) =>
                    current >= modules.length ? 3 : modules.length,
                  )
                }
                className="rounded-lg border border-black px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
              >
                {visibleCount >= modules.length
                  ? "Mostrar menos módulos"
                  : "Mostrar mais módulos"}
              </MotionButton>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
