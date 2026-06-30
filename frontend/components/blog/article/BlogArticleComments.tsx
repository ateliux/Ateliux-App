"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import type { BlogArticle, BlogArticleComment } from "../../../content/blog";
import { siteRoutes } from "../../../data/siteRoutes";
import { isApiError } from "../../../lib/api/client";
import {
  createBlogComment,
  listBlogComments,
  type BlogCommentDto,
} from "../../../services/blog.service";
import { MotionButton, MotionForm, MotionItem } from "../../motion";

type BlogArticleCommentsProps = {
  article: BlogArticle;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Agora"
    : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function fallbackToDto(comment: BlogArticleComment): BlogCommentDto {
  return {
    id: comment.id,
    body: comment.content,
    status: "PUBLISHED",
    createdAt: new Date().toISOString(),
    user: {
      id: comment.id,
      name: comment.author,
      email: comment.role,
    },
  };
}

export function BlogArticleComments({ article }: BlogArticleCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<BlogCommentDto[]>(() => article.commentItems.map(fallbackToDto));
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(Boolean(article.id));
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!article.id) return;

    let ignore = false;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setMessage("");
      void listBlogComments(article.slug)
        .then((response) => {
          if (!ignore) setComments(response);
        })
        .catch((error) => {
          if (!ignore) setMessage(error instanceof Error ? error.message : "Nao foi possivel carregar comentarios.");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [article.id, article.slug]);

  function redirectToLogin() {
    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = content.trim();
    if (!body || !article.id) return;

    try {
      const comment = await createBlogComment(article.id, body);
      setComments((currentComments) => [comment, ...currentComments]);
      setContent("");
      setMessage("Comentario publicado.");
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        redirectToLogin();
        return;
      }
      setMessage(error instanceof Error ? error.message : "Nao foi possivel publicar comentario.");
    }
  }

  return (
    <section
      id="comentarios"
      className="border-t border-white/[0.08] bg-[#08080A]"
      aria-labelledby="article-comments-title"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="mb-8 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-300" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-300">
                  Discussao
                </p>
                <h2
                  id="article-comments-title"
                  className="mt-2 text-3xl font-semibold tracking-tight text-white"
                >
                  {comments.length} comentarios
                </h2>
              </div>
            </div>

            <p className="mb-8 max-w-md text-sm leading-7 text-zinc-500">
              Comentarios sao publicados com a conta do cliente autenticado e ficam disponiveis para moderacao na admin.
            </p>

            <MotionForm
              onSubmit={handleSubmit}
              className="space-y-4 border border-white/[0.08] bg-[#121214] p-5 sm:p-6"
            >
              <MotionItem staggered>
                <div>
                  <label
                    htmlFor={`comment-content-${article.slug}`}
                    className="mb-2 block text-xs font-medium text-zinc-300"
                  >
                    Comentario
                  </label>
                  <textarea
                    id={`comment-content-${article.slug}`}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Escreva sua contribuicao para a discussao"
                    required
                    rows={5}
                    className="w-full resize-none border border-white/[0.08] bg-black px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-white/30"
                  />
                  <p className="mt-2 text-xs leading-5 text-zinc-600">
                    Comentarios usam sua conta autenticada e podem ser moderados pela Ateliux conforme a{" "}
                    <Link href={siteRoutes.privacy} className="font-semibold text-zinc-300 underline">
                      Politica de Privacidade
                    </Link>
                    .
                  </p>
                </div>
              </MotionItem>

              <MotionItem staggered>
                <MotionButton
                  type="submit"
                  className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  Publicar comentario
                </MotionButton>
              </MotionItem>

              {message ? <p className="text-xs text-zinc-500">{message}</p> : null}
            </MotionForm>
          </div>

          <div className="lg:col-span-7">
            <div className="border-y border-white/[0.08]">
              {loading ? (
                <p className="py-8 text-sm text-zinc-500">Carregando comentarios...</p>
              ) : comments.length === 0 ? (
                <p className="py-8 text-sm text-zinc-500">Nenhum comentario publicado ainda.</p>
              ) : (
                <ol className="divide-y divide-white/[0.06]">
                  {comments.map((comment) => {
                    const company = comment.user.clientAccount?.client?.company;
                    return (
                      <li key={comment.id} className="py-7">
                        <article className="flex gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/[0.1] bg-[#121214] text-xs font-semibold text-zinc-300">
                            {getInitials(comment.user.name)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <h3 className="text-sm font-semibold text-zinc-100">
                                {comment.user.name}
                              </h3>
                              {company ? (
                                <span className="text-[11px] text-zinc-600">{company}</span>
                              ) : null}
                              <span className="text-[11px] text-zinc-700">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>

                            <p className="mt-3 text-sm leading-7 text-zinc-400">
                              {comment.body}
                            </p>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
