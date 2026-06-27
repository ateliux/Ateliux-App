import { BlogHero } from "./BlogHero";
import { BlogNewsletter } from "./BlogNewsletter";
import { BlogPostGrid } from "./BlogPostGrid";
import { FeaturedPost } from "./FeaturedPost";
import { MotionItem } from "../motion";
import type { BlogPost } from "@/content/blog";

export function BlogPage({ posts, error }: { posts?: BlogPost[]; error?: string }) {
  const [featuredPost, ...gridPosts] = posts ?? [];
  const hasApiPosts = posts !== undefined;
  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white antialiased">
      <MotionItem direction="down"><BlogHero /></MotionItem>
      {error ? <section className="mx-auto mb-10 max-w-6xl px-6"><div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">{error}</div></section> : null}
      {hasApiPosts && !posts.length ? (
        <section className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-white/40">Blog</p>
          <h2 className="mt-4 text-3xl font-black text-white">Nenhum artigo publicado ainda.</h2>
        </section>
      ) : (
        <MotionItem><FeaturedPost post={featuredPost} /></MotionItem>
      )}
      <MotionItem><BlogNewsletter /></MotionItem>
      {hasApiPosts && !gridPosts.length ? null : <MotionItem><BlogPostGrid posts={hasApiPosts ? gridPosts : undefined} /></MotionItem>}
    </main>
  );
}
