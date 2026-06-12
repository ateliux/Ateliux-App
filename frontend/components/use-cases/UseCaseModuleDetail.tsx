import { ArrowLeft, CheckCircle2, Lightbulb, Wrench } from "lucide-react";
import {
  useCasesContent,
  type UseCaseModule,
} from "../../content/use-cases";
import { UseCaseModuleIcon } from "./UseCaseModuleIcon";
import { MotionButton } from "../motion";

type UseCaseModuleDetailProps = {
  module: UseCaseModule;
  onBack: () => void;
};

export function UseCaseModuleDetail({
  module,
  onBack,
}: UseCaseModuleDetailProps) {
  const categoryLabel =
    useCasesContent.categories.find(
      (category) => category.id === module.categoryId,
    )?.name ?? "Solução digital";

  return (
    <article className="w-full">
      <div className="border-b border-slate-100 px-6 py-8 sm:px-10 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <UseCaseModuleIcon type={module.iconType} />
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-500">
            {categoryLabel}
          </span>
        </div>

        <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          {module.title}
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
          {module.details.intro}
        </p>
      </div>

      <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 xl:grid-cols-2">
        <section aria-labelledby={`${module.id}-benefits`}>
          <div className="mb-5 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
            <h3
              id={`${module.id}-benefits`}
              className="font-semibold text-slate-800"
            >
              Benefícios para o negócio
            </h3>
          </div>

          <ul className="space-y-4">
            {module.details.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex gap-3 text-sm leading-6 text-slate-500"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${module.id}-examples`}>
          <div className="mb-5 flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <h3
              id={`${module.id}-examples`}
              className="font-semibold text-slate-800"
            >
              Exemplos de uso
            </h3>
          </div>

          <ul className="space-y-4">
            {module.details.examples.map((example) => (
              <li
                key={example}
                className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm leading-6 text-slate-500"
              >
                {example}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section
        className="mx-6 mb-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:mx-10 sm:mb-10 sm:p-8"
        aria-labelledby={`${module.id}-implementation`}
      >
        <div className="mb-4 flex items-center gap-3">
          <Wrench className="h-5 w-5 text-blue-500" />
          <h3
            id={`${module.id}-implementation`}
            className="font-semibold text-slate-800"
          >
            Como a Ateliux aplica isso
          </h3>
        </div>

        <p className="text-sm leading-7 text-slate-600">
          {module.details.implementation}
        </p>
      </section>

      <div className="border-t border-slate-100 px-6 py-6 sm:px-10">
        <MotionButton
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para módulos
        </MotionButton>
      </div>
    </article>
  );
}
