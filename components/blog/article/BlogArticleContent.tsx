import type { BlogArticle } from "../../../content/blog";
import { BlogArticleInlineMedia } from "./BlogArticleInlineMedia";

type BlogArticleContentProps = {
  article: BlogArticle;
};

export function BlogArticleContent({ article }: BlogArticleContentProps) {
  return (
    <article className="min-w-0">
      {article.body.map((section, index) => (
        <section key={`${section.title ?? "intro"}-${index}`} className="mb-10">
          {section.title ? (
            <h2 className="mb-5 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
              {section.title}
            </h2>
          ) : null}

          <div className="space-y-6">
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className={`leading-8 text-zinc-400 ${
                  index === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.75] first-letter:text-white"
                    : ""
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {index === 1 ? (
            <BlogArticleInlineMedia media={article.inlineMedia} />
          ) : null}
        </section>
      ))}
    </article>
  );
}
