-- Adds optional project setup fields used by the Admin -> Portal creation flow.
ALTER TABLE "Project"
ADD COLUMN "description" TEXT,
ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "clientFacingSummary" TEXT,
ADD COLUMN "internalNotes" TEXT;

CREATE INDEX "Project_priority_idx" ON "Project"("priority");

CREATE TABLE "ProjectTeamMember" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "roleLabel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectTeamMember_projectId_adminUserId_key" ON "ProjectTeamMember"("projectId", "adminUserId");
CREATE INDEX "ProjectTeamMember_projectId_idx" ON "ProjectTeamMember"("projectId");
CREATE INDEX "ProjectTeamMember_adminUserId_idx" ON "ProjectTeamMember"("adminUserId");

ALTER TABLE "ProjectTeamMember"
ADD CONSTRAINT "ProjectTeamMember_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectTeamMember"
ADD CONSTRAINT "ProjectTeamMember_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
