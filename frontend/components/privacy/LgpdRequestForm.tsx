"use client";

import { useState, type FormEvent } from "react";
import { createPrivacyRequest, type PrivacyRequestInput } from "@/services/privacy.service";

const requestTypes: Array<{ value: PrivacyRequestInput["type"]; label: string }> = [
  { value: "ACCESS", label: "Acesso aos dados" },
  { value: "CORRECTION", label: "Correcao de dados" },
  { value: "DELETION", label: "Eliminacao de dados" },
  { value: "PORTABILITY", label: "Portabilidade" },
  { value: "REVOCATION", label: "Revogacao de consentimento" },
  { value: "INFORMATION", label: "Informacoes sobre tratamento" },
  { value: "OTHER", label: "Outro pedido" },
];

export function LgpdRequestForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const type = String(form.get("type") ?? "ACCESS") as PrivacyRequestInput["type"];
    const message = String(form.get("message") ?? "").trim();

    if (!name || !email) {
      setStatus("Informe nome e e-mail para registrar a solicitacao.");
      return;
    }

    setSubmitting(true);
    setStatus("");
    try {
      await createPrivacyRequest({ name, email, type, message: message || undefined });
      event.currentTarget.reset();
      setStatus("Solicitacao LGPD registrada. A equipe Ateliux avaliara o pedido pelos canais oficiais.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel registrar a solicitacao.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Canal do titular
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
          Enviar solicitacao LGPD
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Use este formulario para registrar pedidos relacionados a privacidade. A resposta pode exigir validacao de identidade.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Nome
              </span>
              <input
                name="name"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                E-mail
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-slate-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tipo de pedido
            </span>
            <select
              name="type"
              defaultValue="ACCESS"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-slate-100"
            >
              {requestTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Mensagem
            </span>
            <textarea
              name="message"
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-slate-100"
              placeholder="Descreva o pedido e, se necessario, informe contexto como e-mail usado no portal, projeto ou canal de contato."
            />
          </label>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-5 text-slate-400">
              Seus dados serao usados para registrar, analisar e responder esta solicitacao. Nao envie senhas ou dados sensiveis desnecessarios.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar solicitacao"}
            </button>
          </div>
        </form>

        {status ? <p className="mt-5 text-sm font-medium text-slate-600">{status}</p> : null}
      </div>
    </section>
  );
}
