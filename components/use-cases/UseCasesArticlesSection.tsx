import type { BlogPost } from "../../content/blog";
import { UseCaseBlogPostCard } from "./UseCaseBlogPostCard";
import { MotionContainer, MotionItem } from "../motion";

type UseCasesArticlesSectionProps = {
  activeCategoryLabel: string;
  posts: readonly BlogPost[];
};

export function UseCasesArticlesSection({
  activeCategoryLabel,
  posts,
}: UseCasesArticlesSectionProps) {
  return (
    <section className="mt-16 border-t border-slate-100 bg-white pb-24">
      <div className="mx-auto max-w-[1400px] px-4 pt-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 flex items-center justify-center text-center text-xl font-medium text-slate-600">
          Artigos populares para{" "}
          <span className="ml-1 font-bold text-blue-500">
            “{activeCategoryLabel}”
          </span>
        </h2>

        <MotionContainer className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <MotionItem key={`${post.tag}-${post.title}`} staggered className="h-full">
            <UseCaseBlogPostCard key={`${post.tag}-${post.title}`} post={post} />
            </MotionItem>
          ))}
        </MotionContainer>
      </div>
    </section>
  );
}
