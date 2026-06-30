import type { ReactNode } from "react";
import type { LegalPageContent } from "../../content/legal";
import { LegalArticle } from "./LegalArticle";
import { LegalTabs } from "./LegalTabs";
import { MotionItem } from "../motion";

type LegalPageProps = {
  page: LegalPageContent;
  children?: ReactNode;
};

export function LegalPage({ page, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#FFF] text-gray-900">
      <MotionItem>
      <section className="border-b border-gray-200/80 px-6 pt-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {page.title}
          </h1>

          <p className="mt-5 text-sm text-gray-500">
            Atualizado em {page.updatedAt}
          </p>

          <LegalTabs activeId={page.id} />
        </div>
      </section>
      </MotionItem>

      <MotionItem><LegalArticle page={page} /></MotionItem>
      {children}
    </main>
  );
}
