"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookmarkX } from "lucide-react";
import { BlogArtwork } from "@/components/blog/BlogArtwork";
import { BlogImagePlaceholder } from "@/components/blog/BlogImagePlaceholder";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { blogPostRoute } from "@/data/siteRoutes";
import { toBlogPost } from "@/lib/blog/api-blog-adapters";
import { listSavedBlogPosts, unsaveBlogPost, type BlogPostDto } from "@/services/blog.service";
import type { BlogPost } from "@/content/blog";

type SavedArticle = BlogPost & {
  savedAt?: string | null;
};

function mapSavedArticle(post: BlogPostDto, index: number): SavedArticle {
  return {
    ...toBlogPost(post, index),
    savedAt: post.savedAt,
  };
}

function formatSavedAt(value?: string | null) {
  if (!value) return "Salvo recentemente";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Salvo recentemente"
    : `Salvo em ${new Intl.DateTimeFormat("pt-BR").format(date)}`;
}

export default function ClientSavedArticlesPage() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listSavedBlogPosts();
      setArticles(response.map(mapSavedArticle));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar artigos salvos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadArticles();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadArticles]);

  async function removeArticle(article: SavedArticle) {
    if (!article.id) return;
    try {
      await unsaveBlogPost(article.id);
      setArticles((current) => current.filter((item) => item.id !== article.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Nao foi possivel remover o artigo salvo.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <ClientPortalPageHeader
        eyebrow="Leituras"
        title="Artigos salvos"
        description="Acesse no Portal do Cliente os artigos do blog que voce salvou para consultar depois."
      />

      {loading ? (
        <LoadingState title="Carregando artigos salvos" />
      ) : error ? (
        <ErrorState title="Nao foi possivel carregar artigos salvos" description={error} onRetry={loadArticles} />
      ) : articles.length === 0 ? (
        <EmptyState title="Nenhum artigo salvo" description="Use o botao de salvar dentro de um artigo do blog para montar sua lista." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ClientPortalCard key={article.id ?? article.slug} className="flex flex-col overflow-hidden">
              <div className="relative h-44 bg-slate-100">
                {article.coverUrl ? (
                  <img src={article.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : !article.id ? (
                  <BlogArtwork artwork={article.artwork} />
                ) : (
                  <BlogImagePlaceholder />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{article.tag}</p>
                <h2 className="mt-3 line-clamp-2 font-bold leading-snug text-slate-900">{article.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{article.description}</p>
                <p className="mt-4 text-xs text-slate-400">{formatSavedAt(article.savedAt)}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={blogPostRoute(article.slug)}
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    Ler artigo
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <ClientPortalButton variant="secondary" onClick={() => void removeArticle(article)}>
                    <BookmarkX className="h-4 w-4" />
                    Remover
                  </ClientPortalButton>
                </div>
              </div>
            </ClientPortalCard>
          ))}
        </div>
      )}
    </div>
  );
}
