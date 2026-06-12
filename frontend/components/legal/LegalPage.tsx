import type { LegalPageContent } from "../../content/legal";
import { LegalArticle } from "./LegalArticle";
import { LegalTabs } from "./LegalTabs";
import { MotionItem } from "../motion";

type LegalPageProps = {
  page: LegalPageContent;
};

export function LegalPage({ page }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#FFF] text-gray-900">
      <MotionItem>
      <section className="border-b border-gray-200/80 px-6 pt-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {page.title}
          </h1>

          <LegalTabs activeId={page.id} />
        </div>
      </section>
      </MotionItem>

      <MotionItem><LegalArticle page={page} /></MotionItem>
    </main>
  );
}
