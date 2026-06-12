import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { contactContent } from "../../content/contact";
import { headerContent } from "../../content/home";
import { siteRoutes } from "../../data/siteRoutes";
import { Logo } from "../ui/Logo";
import { ContactMiniForm } from "./ContactMiniForm";

export function ContactFooterSection() {
  return (
    <section className="px-6 pb-20 pt-10">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1fr_360px] md:items-start">
        <div>
          <Link
            href={siteRoutes.home}
            aria-label="Ir para o início"
            className="mb-10 inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
          >
            <Logo
              src={headerContent.logo.src}
              alt={headerContent.logo.alt}
              className="h-8 w-auto"
            />
          </Link>

          <div className="mb-14 grid gap-8 md:grid-cols-2">
            {contactContent.footer.offices.map((office) => (
              <article key={office.title}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">{office.flag}</span>
                  <h3 className="text-sm font-semibold text-slate-950">
                    {office.title}
                  </h3>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-slate-500">
                  <p className="flex gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {office.address}
                  </p>

                  <p className="flex gap-2">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {office.phone}
                  </p>

                  <p className="flex gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {office.email}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-8 text-xs md:grid-cols-3">
            {contactContent.footer.linkColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h4 className="mb-4 text-sm font-semibold text-slate-950">
                  {column.title}
                </h4>

                <ul className="space-y-3 text-slate-500">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-black"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <ContactMiniForm />
      </div>
    </section>
  );
}
