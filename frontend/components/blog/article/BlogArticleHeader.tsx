import { CalendarDays, Clock3, MessageSquare, Share2 } from "lucide-react";
import type { BlogArticle } from "../../../content/blog";

type BlogArticleHeaderProps = {
  article: BlogArticle;
};

const metadataItems = [
  { key: "date", icon: CalendarDays },
  { key: "readTime", icon: Clock3 },
  { key: "shares", icon: Share2 },
  { key: "comments", icon: MessageSquare },
] as const;

export function BlogArticleHeader({ article }: BlogArticleHeaderProps) {
  const values = {
    date: article.date,
    readTime: article.readTime,
    shares: `${article.shares} compartilhamentos`,
    comments: `${article.comments} comentários`,
  };

  return (
    <header className="relative z-10 mx-auto -mt-44 w-[calc(100%-2rem)] max-w-[920px] border border-white/[0.08] bg-[#121214] px-6 py-10 text-center shadow-2xl shadow-black/40 sm:px-10 md:-mt-52 md:px-16 md:py-14">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-300">
        {article.category}
      </p>

      <h1 className="mx-auto max-w-4xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
        {article.title}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-sm italic leading-7 text-zinc-400 sm:text-base">
        {article.subtitle}
      </p>

      <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        Por {article.author}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/[0.06] pt-6">
        {metadataItems.map(({ key, icon: Icon }) => (
          <span
            key={key}
            className="inline-flex items-center gap-2 text-[11px] text-zinc-500"
          >
            <Icon className="h-3.5 w-3.5" />
            {values[key]}
          </span>
        ))}
      </div>
    </header>
  );
}
