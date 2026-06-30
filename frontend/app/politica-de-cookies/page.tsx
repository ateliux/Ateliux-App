import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalContent } from "../../content/legal";

export const metadata: Metadata = {
  title: "Politica de Cookies - Ateliux",
  description: "Entenda as categorias de cookies usadas pela Ateliux e como gerenciar preferencias.",
};

export default function CookiePolicyRoute() {
  return <LegalPage page={legalContent.cookies} />;
}
