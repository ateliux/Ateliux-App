import Image from "next/image";
import type { BlogArticle } from "../../../content/blog";

type BlogArticleHeroProps = {
  article: BlogArticle;
};

export function BlogArticleHero({ article }: BlogArticleHeroProps) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden border-b border-white/[0.06] md:h-[500px]">
      <Image
        src={article.heroImage}
        alt={article.heroAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black" />
    </div>
  );
}
