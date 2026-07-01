CREATE TYPE "ClientPipelineStatus" AS ENUM (
  'NEW',
  'BRIEFING',
  'DESIGN',
  'DEVELOPMENT',
  'APPROVAL',
  'COMPLETED',
  'INACTIVE'
);

ALTER TABLE "Client"
ADD COLUMN "pipelineStatus" "ClientPipelineStatus" NOT NULL DEFAULT 'NEW';

CREATE INDEX "Client_pipelineStatus_idx" ON "Client"("pipelineStatus");
