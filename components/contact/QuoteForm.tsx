"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, Upload } from "lucide-react";
import { contactContent } from "../../content/contact";
import { ContactInput } from "./ContactInput";
import { MotionButton, MotionCard, MotionForm, MotionItem } from "../motion";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="relative z-20 -mt-28 px-6">
      <MotionCard hover={false} className="mx-auto max-w-4xl bg-white px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:px-16 md:py-12">
        <MotionForm className="grid gap-x-8 gap-y-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.name.label}
            placeholder={contactContent.quote.fields.name.placeholder}
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.email.label}
            placeholder={contactContent.quote.fields.email.placeholder}
            type="email"
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.phone.label}
            placeholder={contactContent.quote.fields.phone.placeholder}
            type="tel"
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.company.label}
            placeholder={contactContent.quote.fields.company.placeholder}
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.projectType.label}
            placeholder={contactContent.quote.fields.projectType.placeholder}
          >
            <select
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
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.timeline.label}
            placeholder={contactContent.quote.fields.timeline.placeholder}
          />
          </MotionItem>

          <MotionItem staggered>
          <ContactInput
            label={contactContent.quote.fields.currentSite.label}
            placeholder={contactContent.quote.fields.currentSite.placeholder}
          />
          </MotionItem>

          <MotionItem staggered className="md:col-span-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-medium text-slate-800">
              {contactContent.quote.fields.skills.label}
            </span>

            <input
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
              <input type="file" className="sr-only" />

              <span className="mb-3 text-xs font-medium text-slate-500">
                {contactContent.quote.fields.file.placeholder}
              </span>

              <span className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800">
                <Upload className="h-3.5 w-3.5" />
                {contactContent.quote.fields.file.buttonLabel}
              </span>
            </label>
          </div>
          </MotionItem>

          <MotionItem staggered className="md:col-span-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-medium text-slate-800">
              {contactContent.quote.fields.message.label}
            </span>

            <textarea
              rows={6}
              placeholder={contactContent.quote.fields.message.placeholder}
              className="w-full resize-none border border-gray-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black"
            />
          </label>
          </MotionItem>

          <MotionItem staggered className="flex flex-col items-center justify-center gap-3 md:col-span-2">
            <MotionButton
              type="submit"
              className="mt-2 rounded-lg bg-black px-12 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
            >
              {contactContent.quote.submitLabel}
            </MotionButton>
            <p aria-live="polite" className="text-xs text-slate-500">
              {submitted ? "Solicitação registrada para demonstração." : ""}
            </p>
          </MotionItem>
        </MotionForm>
      </MotionCard>
    </section>
  );
}
