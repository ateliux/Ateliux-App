"use client";

import { useState, type FormEvent } from "react";
import { MessageSquare } from "lucide-react";
import type {
  BlogArticle,
  BlogArticleComment,
} from "../../../content/blog";
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

export function BlogArticleComments({
  article,
}: BlogArticleCommentsProps) {
  const [comments, setComments] = useState<readonly BlogArticleComment[]>(
    article.commentItems.slice(0, 5),
  );
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedContent = content.trim();

    if (!trimmedName || !trimmedContent) {
      return;
    }

    const newComment: BlogArticleComment = {
      id: `reader-comment-${Date.now()}`,
      author: trimmedName,
      role: "Leitor do Ateliux Blog",
      date: "Agora",
      content: trimmedContent,
    };

    setComments((currentComments) => [newComment, ...currentComments].slice(0, 5));
    setName("");
    setContent("");
  }

  return (
    <section
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
                  Discussão
                </p>
                <h2
                  id="article-comments-title"
                  className="mt-2 text-3xl font-semibold tracking-tight text-white"
                >
                  {comments.length} comentários
                </h2>
              </div>
            </div>

            <p className="mb-8 max-w-md text-sm leading-7 text-zinc-500">
              Compartilhe sua visão sobre o tema e participe da conversa com
              outros leitores do Ateliux Blog.
            </p>

            <MotionForm
              onSubmit={handleSubmit}
              className="space-y-4 border border-white/[0.08] bg-[#121214] p-5 sm:p-6"
            >
              <MotionItem staggered>
              <div>
                <label
                  htmlFor={`comment-name-${article.slug}`}
                  className="mb-2 block text-xs font-medium text-zinc-300"
                >
                  Seu nome
                </label>
                <input
                  id={`comment-name-${article.slug}`}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Como devemos chamar você?"
                  required
                  className="h-11 w-full border border-white/[0.08] bg-black px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-white/30"
                />
              </div>
              </MotionItem>

              <MotionItem staggered>
              <div>
                <label
                  htmlFor={`comment-content-${article.slug}`}
                  className="mb-2 block text-xs font-medium text-zinc-300"
                >
                  Comentário
                </label>
                <textarea
                  id={`comment-content-${article.slug}`}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Escreva sua contribuição para a discussão"
                  required
                  rows={5}
                  className="w-full resize-none border border-white/[0.08] bg-black px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-white/30"
                />
              </div>
              </MotionItem>

              <MotionItem staggered>
              <MotionButton
                type="submit"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                Publicar comentário
              </MotionButton>
              </MotionItem>
            </MotionForm>
          </div>

          <div className="lg:col-span-7">
            <div className="relative h-[620px] overflow-hidden border-y border-white/[0.08] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
              <div className="blog-comments-loop">
                {[false, true].map((isDuplicate) => (
                  <ol
                    key={isDuplicate ? "duplicate" : "original"}
                    aria-hidden={isDuplicate || undefined}
                    className="divide-y divide-white/[0.06] pb-8"
                  >
                    {comments.map((comment) => (
                      <li
                        key={`${isDuplicate ? "duplicate" : "original"}-${comment.id}`}
                        className="py-7"
                      >
                        <article className="flex gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/[0.1] bg-[#121214] text-xs font-semibold text-zinc-300">
                            {getInitials(comment.author)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <h3 className="text-sm font-semibold text-zinc-100">
                                {comment.author}
                              </h3>
                              <span className="text-[11px] text-zinc-600">
                                {comment.role}
                              </span>
                              <span className="text-[11px] text-zinc-700">
                                {comment.date}
                              </span>
                            </div>

                            <p className="mt-3 text-sm leading-7 text-zinc-400">
                              {comment.content}
                            </p>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ol>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
