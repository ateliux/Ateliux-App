-- LGPD privacy foundation: cookie consent audit trail and data subject requests.
-- Non-destructive migration: only creates new tables, indexes and an optional FK.

CREATE TABLE "CookieConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "email" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "source" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "necessary" BOOLEAN NOT NULL DEFAULT true,
    "preferences" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAll" BOOLEAN NOT NULL DEFAULT false,
    "rejectedAll" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieConsent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PrivacyRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "internalNote" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CookieConsent_userId_idx" ON "CookieConsent"("userId");
CREATE INDEX "CookieConsent_anonymousId_idx" ON "CookieConsent"("anonymousId");
CREATE INDEX "CookieConsent_email_idx" ON "CookieConsent"("email");
CREATE INDEX "CookieConsent_source_idx" ON "CookieConsent"("source");
CREATE INDEX "CookieConsent_createdAt_idx" ON "CookieConsent"("createdAt");

CREATE INDEX "PrivacyRequest_email_idx" ON "PrivacyRequest"("email");
CREATE INDEX "PrivacyRequest_type_idx" ON "PrivacyRequest"("type");
CREATE INDEX "PrivacyRequest_status_idx" ON "PrivacyRequest"("status");
CREATE INDEX "PrivacyRequest_createdAt_idx" ON "PrivacyRequest"("createdAt");

ALTER TABLE "CookieConsent"
ADD CONSTRAINT "CookieConsent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
