import Link from "next/link";
import { blogContent } from "../../content/blog";
import { blogPostRoute } from "../../data/siteRoutes";
import { BlogArtwork } from "./BlogArtwork";
import { MotionCard } from "../motion";

export function FeaturedPost() {
  const post = blogContent.featuredPost;

  return (
    <section className="mx-auto mb-16 w-full max-w-6xl px-6">
      <MotionCard>
      <Link
        href={blogPostRoute(post.slug)}
        aria-label={`Ler artigo em destaque: ${post.title}`}
        className="block rounded-[24px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      >
        <article className="flex flex-col overflow-hidden rounded-[24px] border border-white/[0.04] bg-[#121214] md:flex-row">
          <div className="flex w-full flex-col justify-between p-8 md:w-[45%] md:p-12">
            <div>
              <p className="mb-4 text-sm text-zinc-500">{post.tag}</p>

              <h2 className="mb-4 text-3xl font-semibold leading-tight text-[#f4f4f5] md:text-4xl">
                {post.title}
              </h2>

              <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
                {post.description}
              </p>
            </div>

            <p className="mt-12 text-sm text-zinc-500 md:mt-24">
              {post.date}
            </p>
          </div>

          <div className="relative min-h-[300px] w-full bg-[#4652F6] md:min-h-full md:w-[55%]">
            <BlogArtwork artwork={post.artwork} />
          </div>
        </article>
      </Link>
      </MotionCard>
    </section>
  );
}
