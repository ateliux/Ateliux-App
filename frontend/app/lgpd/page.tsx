import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { LgpdRequestForm } from "../../components/privacy/LgpdRequestForm";
import { legalContent } from "../../content/legal";

export const metadata: Metadata = {
  title: "LGPD e Direitos do Titular - Ateliux",
  description: "Canal da Ateliux para solicitacoes relacionadas a dados pessoais e privacidade.",
};

export default function LgpdRoute() {
  return (
    <LegalPage page={legalContent.lgpd}>
      <LgpdRequestForm />
    </LegalPage>
  );
}
