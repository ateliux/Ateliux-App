CREATE TABLE "ClientRequestAttachment" (
  "id" TEXT NOT NULL,
  "clientRequestId" TEXT NOT NULL,
  "fileAssetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ClientRequestAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicketAttachment" (
  "id" TEXT NOT NULL,
  "supportTicketId" TEXT NOT NULL,
  "fileAssetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SupportTicketAttachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientRequestAttachment_clientRequestId_fileAssetId_key"
  ON "ClientRequestAttachment"("clientRequestId", "fileAssetId");

CREATE INDEX "ClientRequestAttachment_clientRequestId_idx"
  ON "ClientRequestAttachment"("clientRequestId");

CREATE INDEX "ClientRequestAttachment_fileAssetId_idx"
  ON "ClientRequestAttachment"("fileAssetId");

CREATE UNIQUE INDEX "SupportTicketAttachment_supportTicketId_fileAssetId_key"
  ON "SupportTicketAttachment"("supportTicketId", "fileAssetId");

CREATE INDEX "SupportTicketAttachment_supportTicketId_idx"
  ON "SupportTicketAttachment"("supportTicketId");

CREATE INDEX "SupportTicketAttachment_fileAssetId_idx"
  ON "SupportTicketAttachment"("fileAssetId");

ALTER TABLE "ClientRequestAttachment"
  ADD CONSTRAINT "ClientRequestAttachment_clientRequestId_fkey"
  FOREIGN KEY ("clientRequestId") REFERENCES "ClientRequest"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientRequestAttachment"
  ADD CONSTRAINT "ClientRequestAttachment_fileAssetId_fkey"
  FOREIGN KEY ("fileAssetId") REFERENCES "FileAsset"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SupportTicketAttachment"
  ADD CONSTRAINT "SupportTicketAttachment_supportTicketId_fkey"
  FOREIGN KEY ("supportTicketId") REFERENCES "SupportTicket"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupportTicketAttachment"
  ADD CONSTRAINT "SupportTicketAttachment_fileAssetId_fkey"
  FOREIGN KEY ("fileAssetId") REFERENCES "FileAsset"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
