"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, Upload } from "lucide-react";
import { contactContent } from "../../content/contact";
import { ContactInput } from "./ContactInput";
import { MotionButton, MotionCard, MotionForm, MotionItem } from "../motion";
import { uploadPublicContactAttachment } from "@/services/uploads.service";
import { createContactLead } from "@/services/contact.service";

type QuoteFormProps = {
  initialEmail?: string;
};

export function QuoteForm({ initialEmail }: QuoteFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage("");

    try {
      const form = new FormData(event.currentTarget);
      const name = String(form.get("name") ?? "").trim();
      const email = String(form.get("email") ?? "").trim();
      const message = String(form.get("message") ?? "").trim();
      let fileAssetId: string | undefined;

      if (!name || !email || !message) {
        setStatusMessage("Preencha nome, e-mail e mensagem para enviar.");
        return;
      }

      if (selectedFile) {
        try {
          const uploaded = await uploadPublicContactAttachment(selectedFile);
          fileAssetId = uploaded.id;
        } catch (error) {
          setStatusMessage(error instanceof Error ? `${error.message} O contato sera enviado sem anexo.` : "Anexo nao enviado. O contato sera enviado sem anexo.");
        }
      }

      await createContactLead({
        name,
        email,
        phone: String(form.get("phone") ?? "").trim() || undefined,
        company: String(form.get("company") ?? "").trim() || undefined,
        projectType: String(form.get("projectType") ?? "").trim() || undefined,
        budget: String(form.get("budget") ?? "").trim() || undefined,
        timeline: String(form.get("timeline") ?? "").trim() || undefined,
        currentSite: String(form.get("currentSite") ?? "").trim() || undefined,
        skills: String(form.get("skills") ?? "").trim() || undefined,
        message,
        fileAssetId,
      });

      setSubmitted(true);
      event.currentTarget.reset();
      setSelectedFile(null);
      setStatusMessage(fileAssetId ? "Solicitacao registrada com anexo aguardando revisao." : "Solicitacao registrada com sucesso.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Nao foi possivel registrar o contato.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative z-20 -mt-28 px-6">
      <MotionCard hover={false} className="mx-auto max-w-4xl bg-white px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:px-16 md:py-12">
        <MotionForm className="grid gap-x-8 gap-y-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.name.label}
            placeholder={contactContent.quote.fields.name.placeholder}
            name="name"
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.email.label}
            placeholder={contactContent.quote.fields.email.placeholder}
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={initialEmail}
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.phone.label}
            placeholder={contactContent.quote.fields.phone.placeholder}
            type="tel"
            name="phone"
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.company.label}
            placeholder={contactContent.quote.fields.company.placeholder}
            name="company"
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.projectType.label}
            placeholder={contactContent.quote.fields.projectType.placeholder}
          >
            <select
              name="projectType"
              defaultValue=""
              className="h-11 w-full appearance-none border border-gray-200 bg-white px-4 text-xs text-slate-900 outline-none transition-colors focus:border-black"
            >
              <option value="" disabled>
                {contactContent.quote.fields.projectType.placeholder}
              </option>
              {contactContent.quote.projectTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </ContactInput>
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.budget.label}
            placeholder={contactContent.quote.fields.budget.placeholder}
            name="budget"
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.timeline.label}
            placeholder={contactContent.quote.fields.timeline.placeholder}
            name="timeline"
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.currentSite.label}
            placeholder={contactContent.quote.fields.currentSite.placeholder}
            name="currentSite"
          />
          </MotionItem>

          <MotionItem staggered className="md:col-span-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-medium text-slate-800">
              {contactContent.quote.fields.skills.label}
            </span>

            <input
              name="skills"
              type="text"
              placeholder={contactContent.quote.fields.skills.placeholder}
              className="h-11 w-full border border-gray-200 bg-white px-4 text-xs text-slate-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black"
            />
          </label>
          </MotionItem>

          <MotionItem staggered className="md:col-span-2">
          <div>
            <span className="mb-2 block text-xs font-medium text-slate-800">
              {contactContent.quote.fields.file.label}
            </span>

            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50/50 px-6 py-6 text-center transition-colors hover:border-black hover:bg-gray-50">
              <input
                name="attachment"
                type="file"
                className="sr-only"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />

              <span className="mb-3 text-xs font-medium text-slate-500">
                {contactContent.quote.fields.file.placeholder}
              </span>

              <span className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800">
                <Upload className="h-3.5 w-3.5" />
                {contactContent.quote.fields.file.buttonLabel}
              </span>
              {selectedFile ? (
                <span className="mt-3 text-[11px] font-medium text-slate-500">
                  {selectedFile.name} - {Math.max(1, Math.round(selectedFile.size / 1024))} KB
                </span>
              ) : null}
            </label>
          </div>
          </MotionItem>

          <MotionItem staggered className="md:col-span-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-medium text-slate-800">
              {contactContent.quote.fields.message.label}
            </span>

            <textarea
              name="message"
              rows={6}
              placeholder={contactContent.quote.fields.message.placeholder}
              className="w-full resize-none border border-gray-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black"
            />
          </label>
          </MotionItem>

          <MotionItem staggered className="flex flex-col items-center justify-center gap-3 md:col-span-2">
            <MotionButton
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-lg bg-black px-12 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
            >
              {submitting ? "Enviando..." : contactContent.quote.submitLabel}
            </MotionButton>
            <p aria-live="polite" className="text-xs text-slate-500">
              {statusMessage || (submitted ? "Solicitacao registrada com sucesso." : "")}
            </p>
          </MotionItem>
        </MotionForm>
      </MotionCard>
    </section>
  );
}
