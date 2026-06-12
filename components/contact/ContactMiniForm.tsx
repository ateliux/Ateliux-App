"use client";

import { useState, type FormEvent } from "react";
import { contactContent } from "../../content/contact";
import { MotionButton, MotionCard, MotionForm, MotionItem } from "../motion";

export function ContactMiniForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <MotionCard hover={false} className="w-full md:max-w-sm">
    <MotionForm className="w-full bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.12)]" onSubmit={handleSubmit}>
      <h3 className="mb-6 text-lg font-semibold text-slate-950">
        {contactContent.footer.form.title}
      </h3>

      <div className="space-y-4">
        <MotionItem staggered>
        <input
          type="text"
          placeholder={contactContent.footer.form.namePlaceholder}
          className="h-12 w-full border border-gray-200 px-4 text-xs outline-none transition-colors placeholder:text-gray-400 focus:border-black"
        />
        </MotionItem>

        <MotionItem staggered>
        <input
          type="email"
          placeholder={contactContent.footer.form.emailPlaceholder}
          className="h-12 w-full border border-gray-200 px-4 text-xs outline-none transition-colors placeholder:text-gray-400 focus:border-black"
        />
        </MotionItem>

        <MotionItem staggered>
        <textarea
          rows={5}
          placeholder={contactContent.footer.form.messagePlaceholder}
          className="w-full resize-none border border-gray-200 px-4 py-3 text-xs outline-none transition-colors placeholder:text-gray-400 focus:border-black"
        />
        </MotionItem>

        <MotionItem staggered>
        <MotionButton
          type="submit"
          className="w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
        >
          {contactContent.footer.form.submitLabel}
        </MotionButton>
        </MotionItem>
        <p aria-live="polite" className="text-xs text-slate-500">
          {submitted ? "Mensagem registrada para demonstração." : ""}
        </p>
      </div>
    </MotionForm>
    </MotionCard>
  );
}
