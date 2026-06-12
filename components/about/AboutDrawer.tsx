"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send, Sparkles, X } from "lucide-react";
import { aboutContent } from "../../content/about";

type AboutDrawerProps = {
  selectedService: string | null;
  onClose: () => void;
};

export function AboutDrawer({
  selectedService,
  onClose,
}: AboutDrawerProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);

    window.setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
      onClose();
    }, 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
        aria-label="Fechar painel"
      />

      <aside className="animate-[slideIn_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards] relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              {aboutContent.drawer.eyebrow}
            </span>

            <h3 className="mt-1 text-xl font-bold text-zinc-950">
              {aboutContent.drawer.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            aria-label="Fechar painel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {aboutContent.drawer.selectedLabel}
            </p>

            <p className="mt-0.5 text-sm font-bold text-zinc-900">
              {selectedService || aboutContent.drawer.defaultService}
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-12 text-center">
            <div className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h4 className="text-lg font-bold text-zinc-900">
              {aboutContent.drawer.success.title}
            </h4>

            <p className="max-w-xs text-sm text-zinc-400">
              {aboutContent.drawer.success.description}
            </p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="mt-8 flex-1 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="about-name"
                className="block text-xs font-bold uppercase tracking-wide text-zinc-700"
              >
                {aboutContent.drawer.form.nameLabel}
              </label>

              <input
                id="about-name"
                type="text"
                required
                placeholder={aboutContent.drawer.form.namePlaceholder}
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 transition-all placeholder:text-zinc-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="about-email"
                className="block text-xs font-bold uppercase tracking-wide text-zinc-700"
              >
                {aboutContent.drawer.form.emailLabel}
              </label>

              <input
                id="about-email"
                type="email"
                required
                placeholder={aboutContent.drawer.form.emailPlaceholder}
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 transition-all placeholder:text-zinc-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="about-message"
                className="block text-xs font-bold uppercase tracking-wide text-zinc-700"
              >
                {aboutContent.drawer.form.messageLabel}
              </label>

              <textarea
                id="about-message"
                rows={4}
                required
                placeholder={aboutContent.drawer.form.messagePlaceholder}
                value={formData.message}
                onChange={(event) =>
                  setFormData({ ...formData, message: event.target.value })
                }
                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 transition-all placeholder:text-zinc-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95"
            >
              <span>{aboutContent.drawer.form.submitLabel}</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="border-t border-zinc-100 pt-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            {aboutContent.drawer.securityText}
          </p>
        </div>
      </aside>

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}