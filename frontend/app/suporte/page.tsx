import type { Metadata } from "next";
import { SupportPage } from "../../components/support/SupportPage";

export const metadata: Metadata = {
  title: "Suporte — Ateliux",
  description:
    "Suporte ao cliente Ateliux para duvidas comerciais, projetos em andamento, pos-entrega e atendimento.",
};

export default function SuporteRoute() {
  return <SupportPage />;
}
