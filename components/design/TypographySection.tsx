import { designContent } from "../../content/design";

export function TypographySection() {
  return (
    <section className="mb-24">
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        {designContent.typography.title}
      </h2>

      <p className="mb-12 max-w-2xl text-sm leading-relaxed text-slate-500">
        {designContent.typography.description}
      </p>

      <div className="flex flex-col items-start gap-16 lg:flex-row lg:gap-32">
        <div className="flex flex-col">
          <span className="mb-4 text-xl font-medium text-slate-500">
            {designContent.typography.fontName}
          </span>

          <div className="relative inline-block">
            <span className="text-9xl font-medium leading-none tracking-tight text-slate-800">
              Aa
            </span>

            <div className="absolute bottom-4 left-[-12px] -z-10 h-12 w-12 rounded-full bg-blue-500" />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-8 pt-4">
          {designContent.typography.weights.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-12"
            >
              <span className={`w-24 text-slate-900 ${item.className}`}>
                {item.name}
              </span>

              <span
                className={`break-all text-sm leading-loose tracking-wide text-slate-800 ${item.className}`}
              >
                {designContent.typography.alphabetLineOne}
                <br />
                {designContent.typography.alphabetLineTwo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
