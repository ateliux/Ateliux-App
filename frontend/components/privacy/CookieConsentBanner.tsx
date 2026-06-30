"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getLocalCookieConsent,
  getOrCreateAnonymousId,
  OPEN_COOKIE_PREFERENCES_EVENT,
  saveLocalCookieConsent,
  type CookieConsentState,
} from "@/lib/privacy/cookie-consent";
import {
  getCookieConsentConfig,
  getCurrentCookieConsent,
  saveCookieConsent,
  type CookieConsentCategory,
  type CookieConsentConfig,
} from "@/services/privacy.service";
import { CookiePreferencesModal } from "./CookiePreferencesModal";

const fallbackConfig: CookieConsentConfig = {
  version: "2026-06-lgpd-v1",
  categories: [
    {
      key: "necessary",
      required: true,
      title: "Necessarios",
      description: "Mantem login, seguranca e funcionamento basico.",
    },
    {
      key: "preferences",
      required: false,
      title: "Preferencias",
      description: "Guarda escolhas de experiencia.",
    },
    {
      key: "analytics",
      required: false,
      title: "Analiticos",
      description: "Ajuda a medir uso agregado do site.",
    },
    {
      key: "marketing",
      required: false,
      title: "Marketing",
      description: "Permite mensurar campanhas quando houver integracoes.",
    },
  ],
  links: {
    privacyPolicy: "/politica-de-privacidade",
    cookiePolicy: "/politica-de-cookies",
    lgpd: "/lgpd",
  },
};

function consentFromBooleans(
  version: string,
  input: Pick<CookieConsentState, "preferences" | "analytics" | "marketing"> & {
    acceptedAll?: boolean;
    rejectedAll?: boolean;
  },
): CookieConsentState {
  return {
    version,
    necessary: true,
    preferences: input.preferences,
    analytics: input.analytics,
    marketing: input.marketing,
    acceptedAll: input.acceptedAll,
    rejectedAll: input.rejectedAll,
    updatedAt: new Date().toISOString(),
  };
}

function sourceFromPath(pathname: string | null) {
  return pathname?.startsWith("/cliente") ? "client_portal" : "public_site";
}

function shouldHideBanner(pathname: string | null) {
  return pathname === "/login" || pathname === "/criar-conta" || pathname?.startsWith("/crm");
}

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [config, setConfig] = useState<CookieConsentConfig>(fallbackConfig);
  const [consent, setConsent] = useState<CookieConsentState>(() =>
    consentFromBooleans(fallbackConfig.version, {
      preferences: false,
      analytics: false,
      marketing: false,
    }),
  );
  const [visible, setVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = useMemo<CookieConsentCategory[]>(() => config.categories, [config.categories]);

  useEffect(() => {
    if (shouldHideBanner(pathname)) return;

    let ignore = false;
    const anonymousId = getOrCreateAnonymousId();

    void getCookieConsentConfig()
      .catch(() => fallbackConfig)
      .then(async (remoteConfig) => {
        if (ignore) return;

        setConfig(remoteConfig);
        const local = getLocalCookieConsent();
        if (local?.version === remoteConfig.version) {
          setConsent(local);
          setVisible(false);
          return;
        }

        const current = await getCurrentCookieConsent(anonymousId).catch(() => null);
        if (ignore) return;

        if (current?.consentVersion === remoteConfig.version) {
          const serverConsent = consentFromBooleans(remoteConfig.version, {
            preferences: current.preferences,
            analytics: current.analytics,
            marketing: current.marketing,
            acceptedAll: current.acceptedAll,
            rejectedAll: current.rejectedAll,
          });
          saveLocalCookieConsent(serverConsent);
          setConsent(serverConsent);
          setVisible(false);
          return;
        }

        setConsent(
          consentFromBooleans(remoteConfig.version, {
            preferences: false,
            analytics: false,
            marketing: false,
          }),
        );
        setVisible(true);
      });

    return () => {
      ignore = true;
    };
  }, [pathname]);

  useEffect(() => {
    const openPreferences = () => {
      setVisible(false);
      setPreferencesOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  const persistConsent = useCallback(
    async (nextConsent: CookieConsentState) => {
      setSaving(true);
      setError("");
      const anonymousId = getOrCreateAnonymousId();
      try {
        const saved = await saveCookieConsent({
          anonymousId,
          source: sourceFromPath(pathname),
          necessary: true,
          preferences: nextConsent.preferences,
          analytics: nextConsent.analytics,
          marketing: nextConsent.marketing,
          acceptedAll: nextConsent.acceptedAll,
          rejectedAll: nextConsent.rejectedAll,
        });
        const stored = consentFromBooleans(saved.consentVersion, {
          preferences: saved.preferences,
          analytics: saved.analytics,
          marketing: saved.marketing,
          acceptedAll: saved.acceptedAll,
          rejectedAll: saved.rejectedAll,
        });
        saveLocalCookieConsent(stored);
        setConsent(stored);
        setVisible(false);
        setPreferencesOpen(false);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Nao foi possivel salvar suas preferencias agora.",
        );
      } finally {
        setSaving(false);
      }
    },
    [pathname],
  );

  if (shouldHideBanner(pathname)) return null;

  return (
    <>
      {visible ? (
        <div className="fixed inset-x-0 bottom-4 z-[70] px-4">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[13px] font-semibold text-slate-950">Cookies</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Usamos cookies necessarios para seguranca e funcionamento. Cookies de preferencias, analise e marketing so entram quando voce permitir. Leia a{" "}
                <Link href={config.links.privacyPolicy} className="font-semibold text-slate-900 underline">
                  politica de privacidade
                </Link>{" "}
                e a{" "}
                <Link href={config.links.cookiePolicy} className="font-semibold text-slate-900 underline">
                  politica de cookies
                </Link>
                .
              </p>
              {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
              <button
                type="button"
                onClick={() => setPreferencesOpen(true)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-[11px] font-semibold text-slate-700 transition-colors hover:border-black hover:text-black"
              >
                Personalizar
              </button>
              <button
                type="button"
                onClick={() =>
                  void persistConsent(
                    consentFromBooleans(config.version, {
                      preferences: false,
                      analytics: false,
                      marketing: false,
                      rejectedAll: true,
                    }),
                  )
                }
                disabled={saving}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-[11px] font-semibold text-slate-700 transition-colors hover:border-black hover:text-black disabled:opacity-60"
              >
                Recusar nao essenciais
              </button>
              <button
                type="button"
                onClick={() =>
                  void persistConsent(
                    consentFromBooleans(config.version, {
                      preferences: true,
                      analytics: true,
                      marketing: true,
                      acceptedAll: true,
                    }),
                  )
                }
                disabled={saving}
                className="rounded-lg bg-black px-3.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CookiePreferencesModal
        open={preferencesOpen}
        categories={categories}
        value={consent}
        saving={saving}
        error={error}
        onChange={setConsent}
        onClose={() => setPreferencesOpen(false)}
        onSave={() => void persistConsent({ ...consent, updatedAt: new Date().toISOString() })}
        onAcceptAll={() =>
          void persistConsent(
            consentFromBooleans(config.version, {
              preferences: true,
              analytics: true,
              marketing: true,
              acceptedAll: true,
            }),
          )
        }
      />
    </>
  );
}
