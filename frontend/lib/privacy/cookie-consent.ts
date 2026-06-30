export type CookieConsentState = {
  version: string;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAll?: boolean;
  rejectedAll?: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_STORAGE_KEY = "ateliux_cookie_consent";
export const COOKIE_ANONYMOUS_ID_STORAGE_KEY = "ateliux_cookie_anonymous_id";
export const COOKIE_CONSENT_UPDATED_EVENT = "ateliux:cookie-consent-updated";
export const OPEN_COOKIE_PREFERENCES_EVENT = "ateliux:open-cookie-preferences";

const consentCookieName = "ateliux_cookie_consent";
const anonymousCookieName = "ateliux_cookie_anonymous_id";
const maxAgeSeconds = 60 * 60 * 24 * 180;

export function getOrCreateAnonymousId() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(COOKIE_ANONYMOUS_ID_STORAGE_KEY);
  if (existing) return existing;

  const id =
    typeof window.crypto?.randomUUID === "function"
      ? `anon_${window.crypto.randomUUID()}`
      : `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(COOKIE_ANONYMOUS_ID_STORAGE_KEY, id);
  writeCookie(anonymousCookieName, id);
  return id;
}

export function getLocalCookieConsent() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookieConsentState) : null;
  } catch {
    return null;
  }
}

export function saveLocalCookieConsent(consent: CookieConsentState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  writeCookie(
    consentCookieName,
    [
      `v:${consent.version}`,
      `p:${consent.preferences ? 1 : 0}`,
      `a:${consent.analytics ? 1 : 0}`,
      `m:${consent.marketing ? 1 : 0}`,
    ].join("|"),
  );
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: consent }));
}

export function hasCookieConsent(category: keyof Pick<CookieConsentState, "preferences" | "analytics" | "marketing">) {
  return Boolean(getLocalCookieConsent()?.[category]);
}

export function requestCookiePreferencesOpen() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}

export function runWhenAnalyticsAllowed(callback: () => void) {
  if (hasCookieConsent("analytics")) {
    callback();
    return;
  }

  const listener = (event: Event) => {
    const consent = (event as CustomEvent<CookieConsentState>).detail;
    if (consent?.analytics) callback();
  };
  window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, listener, { once: true });
}

export function runWhenMarketingAllowed(callback: () => void) {
  if (hasCookieConsent("marketing")) {
    callback();
    return;
  }

  const listener = (event: Event) => {
    const consent = (event as CustomEvent<CookieConsentState>).detail;
    if (consent?.marketing) callback();
  };
  window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, listener, { once: true });
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}
