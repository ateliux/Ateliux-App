import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalContent } from "../../content/legal";

export const metadata: Metadata = {
  title: "Politica de Privacidade - Ateliux",
  description: "Entenda como a Ateliux coleta, utiliza, protege e retém dados pessoais.",
};

export default function PrivacyPolicyRoute() {
  return <LegalPage page={legalContent.privacy} />;
}
