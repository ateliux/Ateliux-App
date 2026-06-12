import type { BlogArticle } from "../../../content/blog";
import { BlogArtwork } from "../BlogArtwork";

type BlogArticleInlineMediaProps = {
  media: BlogArticle["inlineMedia"];
};

export function BlogArticleInlineMedia({
  media,
}: BlogArticleInlineMediaProps) {
  return (
    <figure className="my-12 overflow-hidden border border-white/[0.08] bg-[#121214]">
      <div className="relative h-[260px] w-full sm:h-[340px]">
        <BlogArtwork artwork={media.artwork} />
      </div>

      <figcaption className="border-t border-white/[0.06] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
          {media.title}
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-500">{media.caption}</p>
      </figcaption>
    </figure>
  );
}
