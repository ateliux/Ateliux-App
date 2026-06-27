"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmOnboardingLayout } from "./CrmOnboardingLayout";

export function CrmPhoneValidationStep() {
  const router = useRouter();
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sent) {
      setSent(true);
      return;
    }
    router.push("/crm/onboarding/empresa");
  }

  return (
    <CrmOnboardingLayout step={2}>
      <form onSubmit={submit} className="w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black">Passo 2 de 3</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">Adicione seu telefone</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">Usaremos seu numero para confirmar a conta e manter seu espaco de trabalho seguro.</p>
        <label className="mt-8 block text-sm font-semibold text-slate-700">
          Numero de telefone
          <div className="mt-2 flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-200">
            <span className="border-r border-slate-200 px-4 py-3 text-sm text-slate-500">+55</span>
            <input required type="tel" placeholder="(11) 99999-9999" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none" />
          </div>
        </label>
        {sent ? <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Codigo confirmado para demonstracao.</div> : null}
        <div className="mt-8 flex items-center justify-end">
          <CrmButton type="submit">{sent ? "Continuar" : "Enviar codigo"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></CrmButton>
        </div>
      </form>
    </CrmOnboardingLayout>
  );
}
