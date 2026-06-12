import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalContent } from "../../content/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade — Ateliux",
  description:
    "Entenda como a Ateliux coleta, utiliza e protege dados em seus sites, formulários, projetos e serviços digitais.",
};

export default function PrivacidadeRoute() {
  return <LegalPage page={legalContent.privacy} />;
}