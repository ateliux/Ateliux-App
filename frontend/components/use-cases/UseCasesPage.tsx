"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { blogContent } from "../../content/blog";
import {
  useCasesContent,
  type UseCaseModule,
} from "../../content/use-cases";
import {
  isUseCaseCategoryId,
  type UseCaseCategoryId,
} from "../../data/useCasesNavigation";
import { buildUseCaseRoute } from "../../data/siteRoutes";
import { UseCasesArticlesSection } from "./UseCasesArticlesSection";
import { UseCasesHeader } from "./UseCasesHeader";
import { UseCasesModulesGrid } from "./UseCasesModulesGrid";
import { UseCasesSidebar } from "./UseCasesSidebar";
import { MotionContainer, MotionItem } from "../motion";

export function UseCasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const categoryParam = searchParams.get("category");
  const moduleParam = searchParams.get("module");
  const activeCategory: UseCaseCategoryId = isUseCaseCategoryId(categoryParam)
    ? categoryParam
    : "ecommerce";
  const selectedModule =
    useCasesContent.modules.find(
      (module) =>
        module.id === moduleParam && module.categoryId === activeCategory,
    ) ?? null;

  const activeCategoryLabel =
    useCasesContent.categories.find((category) => category.id === activeCategory)
      ?.name ?? "E-commerce";

  const filteredModules = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("pt-BR");

    return useCasesContent.modules.filter((module) => {
      const belongsToCategory = module.categoryId === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        `${module.title} ${module.description}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery);

      return belongsToCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const filteredPosts = useMemo(() => {
    const activeBlogTags: readonly string[] =
      useCasesContent.blogTagMap[activeCategory] ?? [];

    const posts = blogContent.posts.filter((post) =>
      activeBlogTags.includes(post.tag),
    );

    return posts.length > 0 ? posts : blogContent.posts.slice(0, 3);
  }, [activeCategory]);

  function handleCategoryChange(category: UseCaseCategoryId) {
    router.replace(buildUseCaseRoute({ category }), { scroll: false });
  }

  function handleModuleSelect(module: UseCaseModule) {
    router.replace(
      buildUseCaseRoute({ category: module.categoryId, module: module.id }),
      { scroll: false },
    );
  }

  function handleBackToModules() {
    router.replace(buildUseCaseRoute({ category: activeCategory }), {
      scroll: false,
    });
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <MotionItem direction="down">
      <UseCasesHeader
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onIntegrationSelect={handleCategoryChange}
      />
      </MotionItem>

      <MotionContainer className="mx-auto flex max-w-[1400px] flex-col gap-12 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <MotionItem staggered direction="right">
        <UseCasesSidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        </MotionItem>

        <MotionItem staggered className="min-w-0 flex-1">
        <UseCasesModulesGrid
          key={activeCategory}
          activeCategoryLabel={activeCategoryLabel}
          modules={filteredModules}
          selectedModule={selectedModule}
          onSelectModule={handleModuleSelect}
          onBackToModules={handleBackToModules}
        />
        </MotionItem>
      </MotionContainer>

      <MotionItem>
      <UseCasesArticlesSection
        activeCategoryLabel={activeCategoryLabel}
        posts={filteredPosts}
      />
      </MotionItem>
    </main>
  );
}
