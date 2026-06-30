import type { BlogArticle } from "../../../content/blog";
import { BlogArticleContent } from "./BlogArticleContent";
import { BlogArticleShareBar } from "./BlogArticleShareBar";
import { BlogArticleSidebar } from "./BlogArticleSidebar";
import { MotionItem } from "../../motion";

type BlogArticleLayoutProps = {
  article: BlogArticle;
};

export function BlogArticleLayout({ article }: BlogArticleLayoutProps) {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 pb-28 pt-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-24">
      <MotionItem direction="right" className="lg:col-span-1">
        <BlogArticleShareBar article={article} />
      </MotionItem>

      <MotionItem className="min-w-0 lg:col-span-7">
        <BlogArticleContent article={article} />
      </MotionItem>

      <MotionItem direction="left" className="min-w-0 lg:col-span-4 lg:pl-6">
        <BlogArticleSidebar article={article} />
      </MotionItem>
    </div>
  );
}
