import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { authContent } from "../../content/auth";

const authBrandAssets = {
  icon: "https://res.cloudinary.com/df4wjugxk/image/upload/v1782784827/Trocar_Preto_por_Branco_1_v86v89.png",
  logotype: "https://res.cloudinary.com/df4wjugxk/image/upload/v1782785752/Logotipo_Branca_-_1_-_Editado_j50hzi.png",
} as const;

export function AuthBrandPanel() {
  return (
    <aside className="relative z-10 flex h-full w-full flex-col justify-between border-b border-[#262729] p-8 md:min-h-screen md:border-b-0 md:border-r md:p-14 lg:p-16">
      <div>
        <Link
          href={authContent.brand.backHref}
          className="inline-flex items-center text-xs text-[#888888] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#121214]"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          {authContent.brand.backLabel}
        </Link>
      </div>

      <div className="mt-24 md:mt-0">
        <div className="mb-8 flex items-center gap-5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden">
            <Image
              src={authBrandAssets.icon}
              alt=""
              fill
              sizes="56px"
              className="object-contain"
              priority
            />
          </div>

          <Image
            src={authBrandAssets.logotype}
            alt={authContent.brand.name}
            width={210}
            height={52}
            sizes="210px"
            className="h-9 w-auto max-w-[210px] object-contain"
            priority
          />
        </div>

        <p className="mb-16 max-w-sm text-[13px] leading-[1.6] text-[#888888]">
          {authContent.brand.description}
        </p>

        <nav
          className="flex items-center gap-6 text-[13px] text-[#888888]"
          aria-label="Links institucionais"
        >
          {authContent.brand.links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#121214]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
