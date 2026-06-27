import Link from "next/link";
import { ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import { faqContent } from "../../content/faq";
import { MotionItem } from "../motion";

export function FaqPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 antialiased">
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <MotionItem direction="down">
          <div className="max-w-4xl">
            <span className="mb-5 inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {faqContent.hero.badge}
            </span>

            <h1 className="max-w-5xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
              {faqContent.hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              {faqContent.hero.description}
            </p>
          </div>
        </MotionItem>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {faqContent.highlights.map((item) => (
            <MotionItem key={item.value}>
              <article className="h-full border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.04)]">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {item.value}
                </span>
                <h2 className="mt-5 text-lg font-semibold text-slate-950">
                  {item.label}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </article>
            </MotionItem>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.4fr]">
          <MotionItem>
            <div className="sticky top-24">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
                Respostas diretas para as duvidas mais comuns.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                O conteudo abaixo ajuda a entender o funcionamento atual do
                projeto e evita confundir telas visuais com recursos reais de
                producao.
              </p>
            </div>
          </MotionItem>

          <div className="space-y-10">
            {faqContent.categories.map((category) => (
              <MotionItem key={category.title}>
                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {category.title}
                  </h3>

                  <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
                    {category.items.map((item) => (
                      <article key={item.question} className="p-6 md:p-8">
                        <div className="flex gap-4">
                          <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-slate-950" />
                          <div>
                            <h4 className="text-base font-semibold text-slate-950">
                              {item.question}
                            </h4>
                            <p className="mt-3 text-sm leading-7 text-slate-500">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </MotionItem>
            ))}
          </div>
        </div>
      </section>

      <MotionItem>
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
          <div className="border border-slate-200 bg-slate-950 p-8 text-white md:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {faqContent.cta.eyebrow}
            </span>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                  {faqContent.cta.title}
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                  {faqContent.cta.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href={faqContent.cta.primary.href}
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
                >
                  {faqContent.cta.primary.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href={faqContent.cta.secondary.href}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
                >
                  {faqContent.cta.secondary.label}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </MotionItem>
    </main>
  );
}
