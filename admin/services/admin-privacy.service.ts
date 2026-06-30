import { apiRequest } from "@/lib/api/client";

export type AdminCookieConsent = {
  id: string;
  userId?: string | null;
  anonymousId?: string | null;
  email?: string | null;
  source: string;
  consentVersion: string;
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAll: boolean;
  rejectedAll: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminPrivacyRequest = {
  id: string;
  name: string;
  email: string;
  type: string;
  message?: string | null;
  status: string;
  internalNote?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdatePrivacyRequestInput = {
  status?: string;
  internalNote?: string;
};

export function listPrivacyConsents() {
  return apiRequest<AdminCookieConsent[]>("/admin/privacy/consents");
}

export function listPrivacyRequests() {
  return apiRequest<AdminPrivacyRequest[]>("/admin/privacy/requests");
}

export function getPrivacyRequest(id: string) {
  return apiRequest<AdminPrivacyRequest>(`/admin/privacy/requests/${id}`);
}

export function updatePrivacyRequest(id: string, input: UpdatePrivacyRequestInput) {
  return apiRequest<AdminPrivacyRequest>(`/admin/privacy/requests/${id}`, {
    method: "PATCH",
    json: input,
  });
}
