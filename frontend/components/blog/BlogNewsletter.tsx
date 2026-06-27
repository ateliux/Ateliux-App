"use client";

import { useState, type FormEvent } from "react";
import { blogContent } from "../../content/blog";
import { BlogSocialLinks } from "./BlogSocialLinks";
import { MotionButton } from "../motion";
import { subscribeNewsletter } from "@/services/newsletter.service";

export function BlogNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    setError("");

    try {
      await subscribeNewsletter({ email, origin: "blog" });
      setSubmitted(true);
      setEmail("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel registrar sua inscricao.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mb-16 w-full max-w-6xl px-6">
      <div className="flex flex-col items-start justify-between border-y border-white/[0.08] py-10 md:flex-row md:items-center">
        <div className="mb-8 space-y-5 md:mb-0">
          <h2 className="text-lg font-medium text-[#f4f4f5] md:text-xl">
            {blogContent.newsletter.title}
          </h2>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSubmitted(false);
                setError("");
              }}
              placeholder={blogContent.newsletter.placeholder}
              required
              className="w-full rounded-full border border-white/10 bg-[#0A0A0C] px-6 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-white/30 sm:w-80"
            />

            <MotionButton
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              {submitting ? "Enviando..." : blogContent.newsletter.ctaLabel}
            </MotionButton>
          </form>
          <p aria-live="polite" className="text-xs text-zinc-500">
            {error || (submitted ? "Inscricao registrada com sucesso." : "")}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#f4f4f5]">
            {blogContent.social.title}
          </h3>

          <p className="max-w-[220px] text-sm text-zinc-400">
            {blogContent.social.description}
          </p>

          <BlogSocialLinks />
        </div>
      </div>
    </section>
  );
}
