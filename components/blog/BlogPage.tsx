import { BlogHero } from "./BlogHero";
import { BlogNewsletter } from "./BlogNewsletter";
import { BlogPostGrid } from "./BlogPostGrid";
import { FeaturedPost } from "./FeaturedPost";
import { MotionItem } from "../motion";

export function BlogPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
      <MotionItem direction="down"><BlogHero /></MotionItem>
      <MotionItem><FeaturedPost /></MotionItem>
      <MotionItem><BlogNewsletter /></MotionItem>
      <MotionItem><BlogPostGrid /></MotionItem>
    </main>
  );
}
