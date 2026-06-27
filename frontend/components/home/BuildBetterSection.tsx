import { CheckCircle2 } from "lucide-react";
import { buildContent } from "../../content/home";

export function BuildBetterSection() {
  return (
    <section
      id={buildContent.id}
      className="mx-auto max-w-5xl border-t border-gray-100 px-4 pt-20 sm:px-6 sm:pt-24"
      aria-labelledby="build-title"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <div className="text-center md:col-span-4 md:text-left">
          <h2
            id="build-title"
            className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900"
          >
            {buildContent.title[0]}
            <br />
            {buildContent.title[1]}
          </h2>
          <p className="mx-auto max-w-xs text-sm text-gray-500 md:mx-0">
            {buildContent.description}
          </p>
        </div>

        <div className="grid gap-4 md:col-span-8 md:block md:space-y-10">
          {buildContent.reasons.map((reason) => (
            <article
              key={reason.title}
              className="mx-auto flex w-full max-w-sm flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:max-w-none md:items-start md:rounded-none md:border-0 md:bg-transparent md:p-0 md:text-left md:shadow-none"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 md:hidden">
                <CheckCircle2 className="h-5 w-5 text-gray-900" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{reason.title}</h3>
              <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
                {reason.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
