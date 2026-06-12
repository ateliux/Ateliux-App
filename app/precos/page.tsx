import type { Metadata } from "next";
import { PricingPage } from "../../components/pricing/PricingPage";

export const metadata: Metadata = {
  title: "Preços — Ateliux",
  description:
    "Planos da Ateliux para criação de sites, landing pages, e-commerce, SaaS, dashboards e ecossistemas digitais sob medida.",
};

export default function PrecosRoute() {
  return <PricingPage />;
}