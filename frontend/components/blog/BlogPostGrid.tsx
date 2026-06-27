import { blogContent, type BlogPost } from "../../content/blog";
import { BlogPostCard } from "./BlogPostCard";
import { MotionContainer, MotionItem } from "../motion";

export function BlogPostGrid({ posts = blogContent.posts }: { posts?: readonly BlogPost[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-32">
      <MotionContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <MotionItem key={post.title} staggered className="h-full">
          <BlogPostCard key={post.title} post={post} />
          </MotionItem>
        ))}
      </MotionContainer>
    </section>
  );
}
