import { apiRequest } from "@/lib/api/client";

export type CookieConsentCategory = {
  key: "necessary" | "preferences" | "analytics" | "marketing";
  required: boolean;
  title: string;
  description: string;
};

export type CookieConsentConfig = {
  version: string;
  categories: CookieConsentCategory[];
  links: {
    privacyPolicy: string;
    cookiePolicy: string;
    lgpd: string;
  };
};

export type CookieConsentInput = {
  anonymousId?: string;
  source: "public_site" | "client_portal" | "admin";
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAll?: boolean;
  rejectedAll?: boolean;
};

export type CookieConsentRecord = CookieConsentInput & {
  id: string;
  userId?: string | null;
  email?: string | null;
  consentVersion: string;
  createdAt: string;
  updatedAt: string;
};

export type PrivacyRequestInput = {
  name: string;
  email: string;
  type: "ACCESS" | "CORRECTION" | "DELETION" | "PORTABILITY" | "REVOCATION" | "INFORMATION" | "OTHER";
  message?: string;
};

export function getCookieConsentConfig() {
  return apiRequest<CookieConsentConfig>("/privacy/cookie-consent/config", {
    skipAuthRefresh: true,
  });
}

export function getCurrentCookieConsent(anonymousId: string) {
  const query = new URLSearchParams({ anonymousId }).toString();
  return apiRequest<CookieConsentRecord | null>(`/privacy/cookie-consent/current?${query}`, {
    skipAuthRefresh: true,
  });
}

export function saveCookieConsent(input: CookieConsentInput) {
  return apiRequest<CookieConsentRecord>("/privacy/cookie-consent", {
    method: "POST",
    json: input,
    skipAuthRefresh: true,
  });
}

export function createPrivacyRequest(input: PrivacyRequestInput) {
  return apiRequest<{ id: string }>("/privacy/requests", {
    method: "POST",
    json: input,
    skipAuthRefresh: true,
  });
}
