import type { Metadata } from "next";
import { FaqPage } from "../../components/faq/FaqPage";

export const metadata: Metadata = {
  title: "FAQ — Ateliux",
  description:
    "Perguntas frequentes sobre projetos digitais, processo, suporte, conta e atendimento da Ateliux.",
};

export default function FaqRoute() {
  return <FaqPage />;
}
