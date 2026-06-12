import Link from "next/link";
import type { BlogArticleRelatedItem } from "../../../content/blog";
import { blogPostRoute } from "../../../data/siteRoutes";

type BlogArticleRelatedListProps = {
  items: readonly BlogArticleRelatedItem[];
};

export function BlogArticleRelatedList({
  items,
}: BlogArticleRelatedListProps) {
  return (
    <section className="border-t border-white/[0.08] pt-8">
      <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-300">
        Leituras relacionadas
      </p>

      <ol className="space-y-6">
        {items.map((item, index) => (
          <li key={item.title} className="grid grid-cols-[36px_1fr] gap-4">
            <span className="flex h-8 w-8 items-center justify-center border border-white/20 text-xs font-semibold text-zinc-200">
              {String(index + 1).padStart(2, "0")}
            </span>

            <Link
              href={blogPostRoute(item.slug)}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              <h3 className="text-sm font-medium leading-5 text-zinc-200">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {item.description}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
