import { buildContent } from "../../content/home";

export function BuildBetterSection() {
  return (
    <section
      id={buildContent.id}
      className="mx-auto max-w-5xl border-t border-gray-100 px-6 pt-24"
      aria-labelledby="build-title"
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2
            id="build-title"
            className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900"
          >
            {buildContent.title[0]}
            <br />
            {buildContent.title[1]}
          </h2>
          <p className="text-sm text-gray-500">{buildContent.description}</p>
        </div>

        <div className="space-y-10 md:col-span-8">
          {buildContent.reasons.map((reason) => (
            <article key={reason.title}>
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
