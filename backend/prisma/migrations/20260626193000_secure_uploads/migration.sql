-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE', 'CLIENT_VISIBLE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FileUploadedByType" AS ENUM ('CLIENT', 'ADMIN', 'PUBLIC', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FileContext" AS ENUM ('AVATAR', 'BLOG_COVER', 'CONTACT_ATTACHMENT', 'SUPPORT_ATTACHMENT', 'CLIENT_FILE', 'APPROVAL_ATTACHMENT', 'BRIEFING_ATTACHMENT', 'FINANCE_RECEIPT', 'PREVIEW_ASSET');

-- CreateEnum
CREATE TYPE "FileScanStatus" AS ENUM ('NOT_SCANNED', 'PENDING', 'CLEAN', 'INFECTED', 'FAILED');

-- AlterTable
ALTER TABLE "FileAsset"
ADD COLUMN "cloudinaryPublicId" TEXT,
ADD COLUMN "context" "FileContext" NOT NULL DEFAULT 'CLIENT_FILE',
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "detectedMime" TEXT,
ADD COLUMN "extension" TEXT NOT NULL DEFAULT '',
ADD COLUMN "originalName" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "safeName" TEXT NOT NULL DEFAULT 'file',
ADD COLUMN "scanProvider" TEXT,
ADD COLUMN "scanResult" TEXT,
ADD COLUMN "scanStatus" "FileScanStatus" NOT NULL DEFAULT 'NOT_SCANNED',
ADD COLUMN "scannedAt" TIMESTAMP(3),
ADD COLUMN "secureUrl" TEXT,
ADD COLUMN "status" "FileStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN "uploadedByType" "FileUploadedByType" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN "visibilityV2" "FileVisibility" NOT NULL DEFAULT 'PRIVATE';

UPDATE "FileAsset"
SET
  "originalName" = "name",
  "safeName" = "name",
  "cloudinaryPublicId" = "storageKey",
  "secureUrl" = "url",
  "uploadedByType" = CASE "origin"::text
    WHEN 'CLIENT' THEN 'CLIENT'::"FileUploadedByType"
    WHEN 'ATELIUX' THEN 'ADMIN'::"FileUploadedByType"
    WHEN 'PUBLIC' THEN 'PUBLIC'::"FileUploadedByType"
    ELSE 'SYSTEM'::"FileUploadedByType"
  END,
  "visibilityV2" = CASE "visibility"::text
    WHEN 'VISIBLE_TO_CLIENT' THEN 'CLIENT_VISIBLE'::"FileVisibility"
    ELSE 'PRIVATE'::"FileVisibility"
  END,
  "extension" = COALESCE(NULLIF(lower(substring("name" from '\.[^.]+$')), ''), '');

DROP INDEX IF EXISTS "FileAsset_visibility_idx";

ALTER TABLE "FileAsset" DROP COLUMN "visibility";
ALTER TABLE "FileAsset" RENAME COLUMN "visibilityV2" TO "visibility";

-- CreateIndex
CREATE INDEX "FileAsset_context_idx" ON "FileAsset"("context");

-- CreateIndex
CREATE INDEX "FileAsset_status_idx" ON "FileAsset"("status");

-- CreateIndex
CREATE INDEX "FileAsset_visibility_idx" ON "FileAsset"("visibility");

-- CreateIndex
CREATE INDEX "FileAsset_deletedAt_idx" ON "FileAsset"("deletedAt");
