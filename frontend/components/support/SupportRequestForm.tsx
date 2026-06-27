"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { supportContent } from "../../content/support";
import { MotionButton } from "../motion";
import { createPublicSupportTicket } from "@/services/support.service";

type FormStatus = "idle" | "sent";

const requiredFields = ["name", "email", "category", "subject", "message"];
const priorityMap: Record<string, "LOW" | "MEDIUM" | "HIGH" | "URGENT"> = {
  Baixa: "LOW",
  Media: "MEDIUM",
  Alta: "HIGH",
  Critica: "URGENT",
};

export function SupportRequestForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const hasEmptyRequiredField = requiredFields.some((field) => {
      const value = String(formData.get(field) ?? "").trim();
      return !value;
    });

    if (hasEmptyRequiredField) {
      setStatus("idle");
      setError("Preencha os campos obrigatorios para continuar.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createPublicSupportTicket({
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        company: String(formData.get("company") ?? "").trim() || undefined,
        category: String(formData.get("category") ?? "").trim(),
        priority: priorityMap[String(formData.get("priority") ?? "Media")] ?? "MEDIUM",
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      });
      setStatus("sent");
      form.reset();
    } catch (requestError) {
      setStatus("idle");
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel abrir o chamado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.04)] md:p-8">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {supportContent.form.eyebrow}
      </span>

      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950 md:text-3xl">
        {supportContent.form.title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-500">
        {supportContent.form.description}
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <SupportInput name="name" label={supportContent.form.fields.name.label} placeholder={supportContent.form.fields.name.placeholder} autoComplete="name" required />
          <SupportInput name="email" type="email" label={supportContent.form.fields.email.label} placeholder={supportContent.form.fields.email.placeholder} autoComplete="email" required />
        </div>

        <SupportInput name="company" label={supportContent.form.fields.company.label} placeholder={supportContent.form.fields.company.placeholder} autoComplete="organization" />

        <div className="grid gap-4 md:grid-cols-2">
          <SupportSelect name="category" label={supportContent.form.fields.category.label} placeholder={supportContent.form.fields.category.placeholder} options={supportContent.form.categories} required />
          <SupportSelect name="priority" label={supportContent.form.fields.priority.label} placeholder={supportContent.form.fields.priority.placeholder} options={supportContent.form.priorities} />
        </div>

        <SupportInput name="subject" label={supportContent.form.fields.subject.label} placeholder={supportContent.form.fields.subject.placeholder} required />

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {supportContent.form.fields.message.label}
          </span>
          <textarea
            name="message"
            rows={5}
            placeholder={supportContent.form.fields.message.placeholder}
            required
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
          />
        </label>

        {error ? <p className="text-sm font-medium text-red-600" role="alert">{error}</p> : null}

        {status === "sent" ? (
          <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800" role="status">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
            <span>{supportContent.form.successMessage}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-5 text-slate-400">
            O chamado sera enviado para a API da Ateliux e acompanhado pela equipe de suporte.
          </p>

          <MotionButton
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white"
          >
            {submitting ? "Enviando..." : supportContent.form.submitLabel}
            <Send className="ml-2 h-4 w-4" aria-hidden="true" />
          </MotionButton>
        </div>
      </form>
    </div>
  );
}

type SupportInputProps = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

function SupportInput({ name, label, placeholder, type = "text", autoComplete, required = false }: SupportInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
      />
    </label>
  );
}

type SupportSelectProps = {
  name: string;
  label: string;
  placeholder: string;
  options: readonly string[];
  required?: boolean;
};

function SupportSelect({ name, label, placeholder, options, required = false }: SupportSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
