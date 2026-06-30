import Link from "next/link";
import type { BlogPost } from "../../content/blog";
import { blogPostRoute } from "../../data/siteRoutes";
import { BlogArtwork } from "./BlogArtwork";
import { BlogImagePlaceholder } from "./BlogImagePlaceholder";
import { MotionCard } from "../motion";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <MotionCard className="h-full">
    <Link
      href={blogPostRoute(post.slug)}
      aria-label={`Ler artigo: ${post.title}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.04] bg-[#121214] transition-colors duration-300 hover:border-white/10">
        <div className="relative h-[220px] w-full">
          {post.coverUrl ? (
            <img
              src={post.coverUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : !post.id ? (
            <BlogArtwork artwork={post.artwork} />
          ) : (
            <BlogImagePlaceholder />
          )}
        </div>

        <div className="flex flex-1 flex-col p-7">
          <p className="mb-3 text-[13px] text-zinc-500">
            {post.tag} <span className="mx-1">•</span> {post.date}
          </p>

          <h3 className="mb-3 text-[19px] font-medium leading-snug text-[#f4f4f5]">
            {post.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
            {post.description}
          </p>
        </div>
      </article>
    </Link>
    </MotionCard>
  );
}
