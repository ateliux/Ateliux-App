import type { Metadata } from "next";
import { ContactPage } from "../../components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contato — Ateliux",
  description:
    "Solicite um orçamento para sites, landing pages, e-commerce, SaaS, dashboards, automações e ecossistemas digitais sob medida.",
};

export default function ContatoRoute() {
  return <ContactPage />;
}