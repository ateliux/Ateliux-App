import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticlePage } from "../../../components/blog/article/BlogArticlePage";
import { blogArticles } from "../../../content/blog";

type BlogArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((item) => item.slug === slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} — Ateliux`,
    description: article.description,
  };
}

export default async function BlogArticleRoute({
  params,
}: BlogArticleRouteProps) {
  const { slug } = await params;
  const article = blogArticles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return <BlogArticlePage article={article} />;
}
