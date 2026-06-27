import Image from "next/image";
import { backendBrowserContent } from "../../content/home";

const ateliuxFavicon =
  "https://res.cloudinary.com/df4wjugxk/image/upload/v1781875934/Favicon_1_x8o5ul.png";

export function MissingLinkDiagram() {
  const { missingLink } = backendBrowserContent;

  return (
    <div className="relative z-10 mx-auto max-w-4xl bg-white px-4 pb-20 pt-8 text-center md:pb-24 md:pt-12">
      <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
        {missingLink.title}
      </h3>
      <p className="mx-auto mb-8 max-w-md text-sm text-gray-500">
        {missingLink.description}
      </p>

      <div className="inline-block">
        <div className="flex items-center gap-3 rounded-xl border border-black bg-black px-4 py-2.5">
          <Image
            src={ateliuxFavicon}
            alt="Logotipo Ateliux"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div className="text-left">
            <p className="text-[9px] font-extrabold uppercase leading-none tracking-wider text-white/70">
              {missingLink.badge.eyebrow}
            </p>
            <p className="text-xs font-extrabold leading-tight text-white">
              {missingLink.badge.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
