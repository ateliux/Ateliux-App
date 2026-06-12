import { blogContent } from "../../content/blog";

export function BlogHero() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center px-6 pb-20 pt-32">
      <div className="pointer-events-none absolute left-1/2 top-10 h-[300px] w-[400px] -translate-x-1/2 rounded-full bg-white/5 blur-[100px] md:h-[400px] md:w-[600px]" />

      <h1 className="z-10 mb-4 text-5xl font-bold tracking-tight md:text-6xl">
        {blogContent.hero.title}
      </h1>

      <p className="z-10 max-w-sm text-center text-sm leading-relaxed text-zinc-400 md:text-base">
        {blogContent.hero.description}
      </p>
    </section>
  );
}