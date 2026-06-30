import type { Metadata } from "next";
import { BlogPage } from "../../components/blog/BlogPage";
import { blogArticles } from "../../content/blog";
import { toBlogPost } from "../../lib/blog/api-blog-adapters";
import { canUseDevFallback } from "../../lib/env/is-dev-fallback-enabled";
import { listPublishedBlogPosts } from "../../services/blog.service";
import type { BlogPost } from "../../content/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog - Ateliux",
  description:
    "Conteudos sobre software, design, e-commerce, SaaS, dashboards, automacoes e ecossistemas digitais.",
};

export default async function BlogRoute() {
  let posts: BlogPost[] | undefined;
  let error = "";

  try {
    posts = (await listPublishedBlogPosts()).map(toBlogPost);
  } catch (loadError) {
    if (canUseDevFallback("frontend/public-blog")) {
      posts = blogArticles.map((article) => article);
      error = "Usando fallback de desenvolvimento porque a API do blog nao respondeu.";
    } else {
      posts = [];
      error = loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o blog agora.";
    }
  }

  return <BlogPage posts={posts} error={error} />;
}
