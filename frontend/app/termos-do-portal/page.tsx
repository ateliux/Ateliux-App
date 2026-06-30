import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalContent } from "../../content/legal";

export const metadata: Metadata = {
  title: "Termos do Portal do Cliente - Ateliux",
  description: "Regras de uso do Portal do Cliente da Ateliux.",
};

export default function PortalTermsRoute() {
  return <LegalPage page={legalContent.portalTerms} />;
}
