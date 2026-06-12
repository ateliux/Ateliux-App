import type { Metadata } from "next";
import { Suspense } from "react";
import { UseCasesPage } from "../../components/use-cases/UseCasesPage";

export const metadata: Metadata = {
  title: "Use Cases — Ateliux",
  description:
    "Explore casos de uso, módulos e soluções digitais da Ateliux para e-commerce, SaaS, dashboards, automações, sites e ecossistemas digitais.",
};

export default function UseCasesRoute() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFC]" />}>
      <UseCasesPage />
    </Suspense>
  );
}
