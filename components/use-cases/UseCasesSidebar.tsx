import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCasesContent } from "../../content/use-cases";
import type { UseCaseCategoryId } from "../../data/useCasesNavigation";
import { MotionButton } from "../motion";

type UseCasesSidebarProps = {
  activeCategory: UseCaseCategoryId;
  onCategoryChange: (category: UseCaseCategoryId) => void;
};

export function UseCasesSidebar({
  activeCategory,
  onCategoryChange,
}: UseCasesSidebarProps) {
  return (
    <aside className="w-full flex-shrink-0 lg:w-64">
      <h2 className="mb-6 px-1 text-lg font-bold text-slate-800">
        {useCasesContent.sidebar.title}
      </h2>

      <nav className="flex flex-col space-y-2" aria-label="Categorias de use cases">
        {useCasesContent.categories.map((category) => {
          const isActive = activeCategory === category.id;

          return (
            <MotionButton
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 ${
                isActive
                  ? "border-black bg-black text-white hover:bg-gray-800"
                  : "border-black bg-transparent text-black hover:bg-black hover:text-white"
              }`}
            >
              {category.name}
            </MotionButton>
          );
        })}
      </nav>

      <div className="mt-16 px-1">
        <h3 className="mb-1 text-sm font-bold text-slate-800">
          {useCasesContent.sidebar.help.title}
        </h3>

        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          {useCasesContent.sidebar.help.description}
        </p>

        <Link
          href={useCasesContent.sidebar.help.href}
          className="group flex items-center text-xs font-semibold text-blue-500 hover:text-blue-600"
        >
          {useCasesContent.sidebar.help.label}
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </aside>
  );
}
