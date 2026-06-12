import { heroContent } from "../../content/home";
import { siteRoutes } from "../../data/siteRoutes";
import { FloatingCursor } from "../ui/FloatingCursor";
import { MotionButton, MotionCard } from "../motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-12" aria-labelledby="hero-title">
      <div className="relative mx-auto max-w-5xl">
        {heroContent.cursors.map((cursor) => (
          <FloatingCursor key={cursor.label} {...cursor} />
        ))}

        <MotionCard hover={false} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-1.5 border-b border-gray-50 bg-white/50 px-4 py-3 backdrop-blur-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          </div>

          <div className="relative flex min-h-[400px] items-center justify-center bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[length:40px_40px] bg-center p-8">
            <div className="absolute left-8 top-16 hidden space-y-4 opacity-40 md:block">
              {heroContent.sideLines.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full bg-gray-200 ${
                    index === 1
                      ? "w-24"
                      : index === 3
                        ? "w-28"
                        : index === 2
                          ? "w-20"
                          : "w-16"
                  }`}
                />
              ))}
            </div>

            <div className="z-10 mx-auto max-w-xl rounded-3xl bg-white/60 p-8 text-center shadow-[0_0_40px_20px_rgba(255,255,255,0.8)] backdrop-blur-3xl">
              <h1
                id="hero-title"
                className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-gray-900 md:text-6xl"
              >
                {heroContent.title[0]}
                <br />
                {heroContent.title[1]}
              </h1>
              <p className="mx-auto mb-8 max-w-md text-lg text-gray-500">
                {heroContent.description}
              </p>

              <form
                id={heroContent.form.id}
                action={siteRoutes.contact}
                method="get"
                className="mx-auto flex max-w-sm flex-col gap-2 sm:flex-row"
              >
                <label htmlFor="waitlist-email" className="sr-only">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  placeholder={heroContent.form.placeholder}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  required
                />
                <MotionButton
                  type="submit"
                  className="whitespace-nowrap rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                >
                  {heroContent.form.buttonLabel}
                </MotionButton>
              </form>
            </div>
          </div>
        </MotionCard>
      </div>
    </section>
  );
}
