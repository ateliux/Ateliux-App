import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticlePage } from "../../../components/blog/article/BlogArticlePage";
import { blogArticles, type BlogArticle } from "../../../content/blog";
import { toBlogArticle } from "../../../lib/blog/api-blog-adapters";
import { canUseDevFallback } from "../../../lib/env/is-dev-fallback-enabled";
import { getPublishedBlogPost, listPublishedBlogPosts } from "../../../services/blog.service";

type BlogArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: BlogArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getPublishedBlogPost(slug);
    return {
      title: `${article.title} - Ateliux`,
      description: article.excerpt ?? undefined,
    };
  } catch {
    const article = canUseDevFallback("frontend/public-blog-article-metadata")
      ? blogArticles.find((item) => item.slug === slug)
      : undefined;

    if (!article) return {};

    return {
      title: `${article.title} - Ateliux`,
      description: article.description,
    };
  }
}

export default async function BlogArticleRoute({
  params,
}: BlogArticleRouteProps) {
  const { slug } = await params;
  let articlePageArticle: BlogArticle | undefined;

  try {
    const [article, posts] = await Promise.all([
      getPublishedBlogPost(slug),
      listPublishedBlogPosts().catch(() => []),
    ]);
    articlePageArticle = toBlogArticle(article, posts);
  } catch {
    articlePageArticle = canUseDevFallback("frontend/public-blog-article")
      ? blogArticles.find((item) => item.slug === slug)
      : undefined;

    if (!articlePageArticle) {
      notFound();
    }
  }

  return <BlogArticlePage article={articlePageArticle} />;
}
