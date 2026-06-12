import type { BlogArticle } from "../../../content/blog";
import { BlogArticleComments } from "./BlogArticleComments";
import { BlogArticleHeader } from "./BlogArticleHeader";
import { BlogArticleHero } from "./BlogArticleHero";
import { BlogArticleLayout } from "./BlogArticleLayout";
import { MotionCard, MotionItem } from "../../motion";

type BlogArticlePageProps = {
  article: BlogArticle;
};

export function BlogArticlePage({ article }: BlogArticlePageProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
      <MotionCard hover={false}><BlogArticleHero article={article} /></MotionCard>
      <MotionItem><BlogArticleHeader article={article} /></MotionItem>
      <BlogArticleLayout article={article} />
      <MotionItem><BlogArticleComments article={article} /></MotionItem>
    </main>
  );
}
