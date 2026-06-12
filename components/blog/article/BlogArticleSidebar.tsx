import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { BlogArticle } from "../../../content/blog";
import { contactRoute } from "../../../data/siteRoutes";
import { BlogArticleRelatedList } from "./BlogArticleRelatedList";

type BlogArticleSidebarProps = {
  article: BlogArticle;
};

export function BlogArticleSidebar({ article }: BlogArticleSidebarProps) {
  return (
    <aside className="space-y-14 lg:sticky lg:top-28 lg:self-start">
      <section className="relative min-h-[360px] overflow-hidden border border-white/[0.08] bg-[#121214] p-7">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full border-[32px] border-blue-400/10" />
        <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full border-[24px] border-white/[0.04]" />

        <div className="relative flex min-h-[304px] flex-col justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-300">
              {article.sideNote.eyebrow}
            </p>
            <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white">
              {article.sideNote.title}
            </h2>
          </div>

          <div>
            <p className="text-sm leading-6 text-zinc-400">
              {article.sideNote.description}
            </p>
            <Link
              href={contactRoute({ subject: "artigo-blog" })}
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:text-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              Falar com a Ateliux
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <BlogArticleRelatedList items={article.relatedItems} />
    </aside>
  );
}
