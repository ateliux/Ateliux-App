import type { Metadata } from "next";
import { AboutPage } from "../../components/about/AboutPage";

export const metadata: Metadata = {
  title: "Sobre — Ateliux",
  description:
    "Conheça a Ateliux, empresa de criação de software, sites, e-commerce, SaaS, dashboards e ecossistemas digitais sob medida.",
};

export default function SobreRoute() {
  return <AboutPage />;
}