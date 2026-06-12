import Link from "next/link";
import { contactContent } from "../../content/contact";
import { siteRoutes } from "../../data/siteRoutes";

export function ContactHero() {
  return (
    <section className="relative flex min-h-[360px] w-full flex-col items-center overflow-hidden bg-black px-6 pb-32 pt-16 text-center text-white md:min-h-[410px] md:pt-20">
      <div className="pointer-events-none absolute -left-10 top-20 h-20 w-20 rounded-full border-[10px] border-white/5" />
      <div className="pointer-events-none absolute right-16 top-24 h-12 w-12 rounded-full border-[8px] border-white/5" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-80 w-80 rotate-12 rounded-[5rem] bg-white/[0.04]" />
      <div className="pointer-events-none absolute left-[8%] top-[-90px] h-72 w-72 rotate-45 rounded-[4rem] bg-white/[0.03]" />

      <Link
        href={siteRoutes.home}
        className="absolute left-8 top-8 text-xs font-medium text-white/50 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      >
        Voltar ao início
      </Link>

      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          {contactContent.hero.title}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
          {contactContent.hero.description}
        </p>
      </div>
    </section>
  );
}
