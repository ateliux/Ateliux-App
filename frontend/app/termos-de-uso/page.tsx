import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalContent } from "../../content/legal";

export const metadata: Metadata = {
  title: "Termos de Uso - Ateliux",
  description: "Leia os termos de uso dos canais digitais, conteudos e servicos da Ateliux.",
};

export default function TermsOfUseRoute() {
  return <LegalPage page={legalContent.terms} />;
}
