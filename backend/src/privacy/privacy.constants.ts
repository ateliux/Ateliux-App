export const COOKIE_CONSENT_VERSION = '2026-06-lgpd-v1';

export const COOKIE_CONSENT_SOURCES = ['public_site', 'client_portal', 'admin'] as const;
export type CookieConsentSource = (typeof COOKIE_CONSENT_SOURCES)[number];

export const PRIVACY_REQUEST_TYPES = [
  'ACCESS',
  'CORRECTION',
  'DELETION',
  'PORTABILITY',
  'REVOCATION',
  'INFORMATION',
  'OTHER',
] as const;
export type PrivacyRequestType = (typeof PRIVACY_REQUEST_TYPES)[number];

export const PRIVACY_REQUEST_STATUSES = [
  'OPEN',
  'IN_REVIEW',
  'RESPONDED',
  'CLOSED',
  'REJECTED',
] as const;
export type PrivacyRequestStatus = (typeof PRIVACY_REQUEST_STATUSES)[number];
