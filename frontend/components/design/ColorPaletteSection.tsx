import { designContent } from "../../content/design";

export function ColorPaletteSection() {
  return (
    <section className="mb-24">
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        {designContent.palette.title}
      </h2>

      <p className="mb-12 max-w-3xl text-sm leading-relaxed text-slate-500">
        {designContent.palette.description}
      </p>

      <div className="grid grid-cols-2 grid-rows-2 overflow-hidden rounded-2xl shadow-sm md:h-80 md:grid-cols-5">
        <div
          className="col-span-2 row-span-2 flex flex-col justify-between p-8 text-white"
          style={{ backgroundColor: designContent.palette.primary.hex }}
        >
          <span className="text-sm font-medium opacity-80">
            {designContent.palette.schemeLabel}
          </span>

          <div>
            <div className="mb-1 text-2xl font-semibold">
              {designContent.palette.primary.label}
            </div>
            <div className="text-sm uppercase tracking-wider opacity-80">
              {designContent.palette.primary.hex}
            </div>
          </div>
        </div>

        {designContent.palette.colors.map((color) => (
          <div
            key={color.hex}
            className={`flex items-end p-6 text-xs tracking-wider ${color.textClass} ${
              "borderClass" in color ? color.borderClass : ""
            }`}
            style={{ backgroundColor: color.hex }}
          >
            <div>
              <div className="mb-1 text-lg font-semibold">{color.label}</div>
              <div className="uppercase opacity-80">{color.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
