import { Search } from "lucide-react";
import { useCasesContent } from "../../content/use-cases";
import type { UseCaseCategoryId } from "../../data/useCasesNavigation";
import { UseCasesIntegrationIcon } from "./UseCasesIntegrationIcon";
import { MotionButton } from "../motion";

type UseCasesHeaderProps = {
  activeCategory: UseCaseCategoryId;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onIntegrationSelect: (category: UseCaseCategoryId) => void;
};

const integrationCategoryMap: Record<string, UseCaseCategoryId> = {
  whatsapp: "ecommerce",
  instagram: "marketing",
  gmail: "automations",
  sheets: "dashboards",
  stripe: "ecommerce",
};

export function UseCasesHeader({
  activeCategory,
  searchQuery,
  onSearchChange,
  onIntegrationSelect,
}: UseCasesHeaderProps) {
  return (
    <header className="flex flex-col items-center justify-center space-y-8 pb-8 pt-12">
      <div className="relative w-full max-w-2xl px-4">
        <div className="pointer-events-none absolute inset-y-0 left-8 flex items-center">
          <Search className="h-5 w-5 text-slate-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="block w-full rounded-full border-0 bg-white py-4 pl-14 pr-4 text-slate-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 sm:text-sm"
          placeholder={useCasesContent.header.searchPlaceholder}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 px-4">
        {useCasesContent.header.integrations.map((integration) => (
          <MotionButton
            key={integration.id}
            type="button"
            aria-label={integration.label}
            aria-pressed={activeCategory === integrationCategoryMap[integration.id]}
            onClick={() => onIntegrationSelect(integrationCategoryMap[integration.id])}
            className={`flex h-14 w-14 items-center justify-center rounded-full border bg-white shadow-sm transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 ${
              activeCategory === integrationCategoryMap[integration.id]
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-slate-100"
            }`}
          >
            <UseCasesIntegrationIcon icon={integration.icon} />
          </MotionButton>
        ))}
      </div>
    </header>
  );
}
