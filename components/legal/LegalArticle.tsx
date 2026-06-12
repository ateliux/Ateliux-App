import type { LegalPageContent } from "../../content/legal";
import { MotionContainer, MotionItem } from "../motion";

type LegalArticleProps = {
  page: LegalPageContent;
};

export function LegalArticle({ page }: LegalArticleProps) {
  return (
    <article className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <MotionContainer className="max-w-2xl space-y-12">
          {page.sections.map((section) => (
            <MotionItem key={section.title} staggered>
            <section key={section.title}>
              <h2 className="mb-6 text-xl font-bold tracking-tight text-gray-900">
                {section.title}
              </h2>

              <div className="space-y-5 text-[17px] leading-relaxed tracking-wide text-gray-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {section.notice ? (
                <div className="mt-8 border-l-4 border-yellow-400 pl-6">
                  <ol className="space-y-5 text-[16px] leading-relaxed tracking-wide text-gray-700">
                    {section.notice.map((item, index) => (
                      <li key={item}>
                        {index + 1}. {item}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </section>
            </MotionItem>
          ))}
        </MotionContainer>
      </div>
    </article>
  );
}
