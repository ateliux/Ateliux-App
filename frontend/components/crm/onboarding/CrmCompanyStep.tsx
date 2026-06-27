"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { crmCompanySizes } from "@/data/crm/crm-mock-data";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmOnboardingLayout } from "./CrmOnboardingLayout";

export function CrmCompanyStep() {
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/crm/visao-geral");
  }

  return (
    <CrmOnboardingLayout step={3}>
      <form onSubmit={submit} className="w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black">Passo 3 de 3</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Conte sobre sua empresa</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Essas informacoes ajudam a preparar a estrutura inicial do CRM.</p>
        <div className="mt-8 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Nome da empresa<input required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200" /></label>
          <label className="block text-sm font-semibold text-slate-700">Site<input type="url" placeholder="https://" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200" /></label>
          <label className="block text-sm font-semibold text-slate-700">Tamanho da equipe<select required defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"><option value="" disabled>Selecione</option>{crmCompanySizes.map((size) => <option key={size}>{size} pessoas</option>)}</select></label>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <CrmButton variant="ghost" onClick={() => router.push("/crm/onboarding/telefone")}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Voltar</CrmButton>
          <CrmButton type="submit">Concluir configuracao<ArrowRight className="h-4 w-4" aria-hidden="true" /></CrmButton>
        </div>
      </form>
    </CrmOnboardingLayout>
  );
}
