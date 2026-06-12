import Link from "next/link";
import type { BlogPost } from "../../content/blog";
import { blogPostRoute } from "../../data/siteRoutes";
import { BlogArtwork } from "../blog/BlogArtwork";
import { MotionCard } from "../motion";

type UseCaseBlogPostCardProps = {
  post: BlogPost;
};

export function UseCaseBlogPostCard({ post }: UseCaseBlogPostCardProps) {
  return (
    <MotionCard className="h-full">
    <Link
      href={blogPostRoute(post.slug)}
      aria-label={`Ler artigo: ${post.title}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
    >
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-colors duration-300 hover:border-slate-200">
      <div className="relative h-[220px] w-full">
        <BlogArtwork artwork={post.artwork} />
      </div>

      <div className="flex flex-1 flex-col p-7">
        <p className="mb-3 text-[13px] text-slate-400">
          {post.tag} <span className="mx-1">•</span> {post.date}
        </p>

        <h3 className="mb-3 text-[19px] font-medium leading-snug text-slate-950">
          {post.title}
        </h3>

        <p className="text-sm leading-relaxed text-slate-500">
          {post.description}
        </p>
      </div>
    </article>
    </Link>
    </MotionCard>
  );
}
