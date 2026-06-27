import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  LifeBuoy,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { supportContent } from "../../content/support";
import { MotionItem } from "../motion";
import { SupportRequestForm } from "./SupportRequestForm";

const supportIconMap = {
  project: ClipboardList,
  commercial: MessageCircle,
  delivery: LifeBuoy,
} as const;

export function SupportPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 antialiased">
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <MotionItem direction="down">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="mb-5 inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {supportContent.hero.badge}
              </span>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
                {supportContent.hero.title}
              </h1>
            </div>

            <p className="max-w-xl text-sm leading-7 text-slate-500 md:text-base">
              {supportContent.hero.description}
            </p>
          </div>
        </MotionItem>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {supportContent.channels.map((channel) => {
            const Icon = supportIconMap[channel.icon];

            return (
              <MotionItem key={channel.title}>
                <article className="group flex h-full flex-col justify-between border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.04)] transition-colors hover:border-slate-950">
                  <div>
                    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                      {channel.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-500">
                      {channel.description}
                    </p>
                  </div>

                  <span className="mt-8 inline-flex items-center text-sm font-semibold text-slate-950">
                    {channel.action}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </article>
              </MotionItem>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <MotionItem>
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
                {supportContent.process.title}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
                {supportContent.process.description}
              </p>
            </div>
          </MotionItem>

          <div className="grid gap-4">
            {supportContent.process.steps.map((step, index) => (
              <MotionItem key={step.title}>
                <article className="grid gap-5 border border-slate-200 bg-white p-6 md:grid-cols-[auto_1fr] md:p-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </article>
              </MotionItem>
            ))}
          </div>
        </div>
      </section>

      <section
        id="solicitacao-suporte"
        className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:px-12 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"
      >
        <MotionItem>
          <div className="sticky top-24 border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.04)] md:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {supportContent.cta.title}
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Suporte focado no que voce precisa resolver.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              {supportContent.cta.description}
            </p>

            <div className="mt-8 space-y-4">
              {supportContent.notes.map((note) => (
                <p
                  key={note}
                  className="border-l border-slate-950 pl-4 text-sm leading-7 text-slate-500"
                >
                  {note}
                </p>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={supportContent.cta.primary.href}
                className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              >
                {supportContent.cta.primary.label}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={supportContent.cta.secondary.href}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:border-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white"
              >
                {supportContent.cta.secondary.label}
              </Link>
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <SupportRequestForm />
        </MotionItem>
      </section>
    </main>
  );
}
