"use client";

import Link from "next/link";
import { useState } from "react";
import type { CookieConsentState } from "@/lib/privacy/cookie-consent";
import type { CookieConsentCategory } from "@/services/privacy.service";

type CookiePreferencesModalProps = {
  open: boolean;
  categories: CookieConsentCategory[];
  value: CookieConsentState;
  saving?: boolean;
  error?: string;
  onChange: (value: CookieConsentState) => void;
  onClose: () => void;
  onSave: () => void;
  onAcceptAll: () => void;
};

const categoryTitle: Record<CookieConsentCategory["key"], string> = {
  necessary: "Cookies essenciais",
  preferences: "Cookies de preferencias",
  analytics: "Cookies analiticos",
  marketing: "Cookies de publicidade",
};

export function CookiePreferencesModal({
  open,
  categories,
  value,
  saving = false,
  error,
  onChange,
  onClose,
  onSave,
  onAcceptAll,
}: CookiePreferencesModalProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!open) return null;

  function update(key: CookieConsentCategory["key"], checked: boolean) {
    if (key === "necessary") return;
    onChange({ ...value, [key]: checked, acceptedAll: false, rejectedAll: false });
  }

  function toggleExpanded(key: string) {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/25">
      <button
        type="button"
        aria-label="Fechar configuracoes de cookies"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        className="relative ml-auto flex h-dvh w-full max-w-[460px] flex-col bg-white text-[#171a1f] shadow-[-18px_0_60px_rgba(15,23,42,0.14)]"
      >
        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-5 md:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-ml-2 grid h-8 w-8 place-items-center rounded-full text-xl font-light leading-none text-black transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            x
          </button>

          <h2
            id="cookie-preferences-title"
            className="mt-2 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-[#171a1f]"
          >
            Configuracoes de cookies
          </h2>

          <div className="mt-5 space-y-4 text-[14px] leading-6 tracking-[-0.01em] text-slate-600">
            <p>
              Cookies ajudam a melhorar sua experiencia, adaptar recursos aos seus interesses e aprimorar nosso site.
            </p>
            <p>
              Veja detalhes sobre cada categoria expandindo os itens abaixo. Leia nossa{" "}
              <Link href="/politica-de-cookies" className="underline underline-offset-2">
                Politica de Cookies
              </Link>{" "}
              para entender como usamos cookies e como ajustar suas preferencias depois.
            </p>
          </div>

          <div className="mt-8 space-y-1">
            {categories.map((category) => {
              const checked = category.key === "necessary" ? true : Boolean(value[category.key]);
              const isExpanded = Boolean(expanded[category.key]);

              return (
                <div key={category.key} className="border-b border-slate-100/70">
                  <div className="flex min-h-[46px] items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(category.key)}
                      aria-expanded={isExpanded}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    >
                      <span className="w-4 shrink-0 text-[24px] font-light leading-none text-[#171a1f]">
                        {isExpanded ? "-" : "+"}
                      </span>
                      <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#171a1f]">
                        {categoryTitle[category.key]}
                      </span>
                    </button>

                    {category.required ? (
                      <span className="shrink-0 text-[12px] font-medium text-emerald-700">
                        Sempre ativo
                      </span>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        onClick={() => update(category.key, !checked)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                          checked ? "bg-black" : "bg-[#cfd0d5]"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            checked ? "translate-x-[22px]" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {isExpanded ? (
                    <p className="ml-8 max-w-[340px] pb-4 pt-1 text-[12px] leading-5 text-slate-500">
                      {category.description}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-6 pb-5 pt-4 md:px-8">
          {error ? <p className="mb-3 text-xs font-medium text-red-600">{error}</p> : null}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-full bg-[#171a1f] px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Confirmar escolhas"}
            </button>

            <button
              type="button"
              onClick={onAcceptAll}
              disabled={saving}
              className="px-2 py-3 text-[13px] font-semibold text-[#171a1f] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              Aceitar todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
