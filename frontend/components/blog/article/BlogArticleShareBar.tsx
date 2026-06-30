"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MessageSquare, Send, Share2 } from "lucide-react";
import type { BlogArticle } from "../../../content/blog";
import { isApiError } from "../../../lib/api/client";
import {
  createBlogMessageThread,
  getBlogSavedStatus,
  saveBlogPost,
  shareBlogPost,
  unsaveBlogPost,
} from "../../../services/blog.service";

type BlogArticleShareBarProps = {
  article: BlogArticle;
};

export function BlogArticleShareBar({ article }: BlogArticleShareBarProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!article.id) return;
    void getBlogSavedStatus(article.id)
      .then((response) => setSaved(response.saved))
      .catch(() => undefined);
  }, [article.id]);

  function redirectToLogin() {
    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
  }

  async function toggleSaved() {
    if (!article.id) return;
    try {
      const response = saved ? await unsaveBlogPost(article.id) : await saveBlogPost(article.id);
      setSaved(response.saved);
      setStatus(response.saved ? "Artigo salvo no portal." : "Artigo removido dos salvos.");
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        redirectToLogin();
        return;
      }
      setStatus("Nao foi possivel atualizar artigos salvos.");
    }
  }

  function scrollToComments() {
    document.getElementById("comentarios")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStatus("Comentarios abertos.");
  }

  async function openMessageThread() {
    if (!article.id) return;
    try {
      const response = await createBlogMessageThread(article.id);
      router.push(response.href);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        redirectToLogin();
        return;
      }
      setStatus("Nao foi possivel abrir conversa sobre o artigo.");
    }
  }

  async function shareArticle() {
    const shareData = {
      title: article.title,
      text: article.description,
      url: window.location.href,
    };

    try {
      const canShare = "share" in navigator;
      if (canShare) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
      }
      if (article.id) await shareBlogPost(article.id, "web");
      setStatus(canShare ? "Artigo compartilhado." : "Link copiado.");
    } catch {
      setStatus("Compartilhamento cancelado.");
    }
  }

  const actions = [
    { label: saved ? "Remover dos salvos" : "Salvar artigo", icon: Bookmark, onClick: toggleSaved, active: saved },
    { label: "Ver comentarios", icon: MessageSquare, onClick: scrollToComments, active: false },
    { label: "Falar no portal", icon: Send, onClick: openMessageThread, active: false },
    { label: "Compartilhar artigo", icon: Share2, onClick: shareArticle, active: false },
  ] as const;

  return (
    <nav
      aria-label="Acoes do artigo"
      className="flex gap-2 lg:sticky lg:top-28 lg:grid lg:grid-cols-1"
    >
      {actions.map(({ label, icon: Icon, onClick, active }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={() => void onClick()}
          className={`flex h-11 w-11 items-center justify-center border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black ${
            active
              ? "border-white bg-white text-black"
              : "border-white/[0.08] bg-[#0A0A0C] text-zinc-500 hover:border-white/20 hover:bg-white hover:text-black"
          }`}
        >
          <Icon className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
        </button>
      ))}
      <span className="sr-only" aria-live="polite">{status}</span>
    </nav>
  );
}
