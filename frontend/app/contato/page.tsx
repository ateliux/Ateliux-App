import type { Metadata } from "next";
import { ContactPage } from "../../components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contato — Ateliux",
  description:
    "Solicite um orçamento para sites, landing pages, e-commerce, SaaS, dashboards, automações e ecossistemas digitais sob medida.",
};

type ContatoRouteProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function ContatoRoute({ searchParams }: ContatoRouteProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  return <ContactPage initialEmail={email?.trim()} />;
}
