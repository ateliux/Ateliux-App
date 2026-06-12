import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalContent } from "../../content/legal";

export const metadata: Metadata = {
  title: "Termos e Condições — Ateliux",
  description:
    "Leia os termos e condições de uso dos serviços, projetos digitais e soluções desenvolvidas pela Ateliux.",
};

export default function TermosRoute() {
  return <LegalPage page={legalContent.terms} />;
}