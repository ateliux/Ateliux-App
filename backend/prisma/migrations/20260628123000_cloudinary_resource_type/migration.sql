ALTER TABLE "FileAsset"
  ADD COLUMN "cloudinaryResourceType" TEXT;

UPDATE "FileAsset"
SET "cloudinaryResourceType" = CASE
  WHEN "storageProvider" = 'cloudinary' AND "mimeType" LIKE 'image/%' THEN 'image'
  WHEN "storageProvider" = 'cloudinary' AND "mimeType" LIKE 'video/%' THEN 'video'
  WHEN "storageProvider" = 'cloudinary' THEN 'raw'
  ELSE NULL
END
WHERE "cloudinaryResourceType" IS NULL;

CREATE INDEX "FileAsset_cloudinaryResourceType_idx"
  ON "FileAsset"("cloudinaryResourceType");
