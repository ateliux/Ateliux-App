-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'SUPPORT', 'EDITOR', 'FINANCE', 'DESIGNER_DEV', 'ATTENDANCE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'WAITING_CLIENT', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SENT_TO_CLIENT', 'WAITING_APPROVAL', 'CHANGES_REQUESTED', 'APPROVED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BriefingStatus" AS ENUM ('DRAFT', 'SENT', 'ANSWERED', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'SENT', 'WAITING_CLIENT', 'APPROVED', 'CHANGES_REQUESTED', 'RESENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PreviewStatus" AS ENUM ('DRAFT', 'SENT', 'IN_APPROVAL', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VisibilityStatus" AS ENUM ('INTERNAL', 'VISIBLE_TO_CLIENT');

-- CreateEnum
CREATE TYPE "InboxChannel" AS ENUM ('CLIENTS', 'SUPPORT');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InboxSource" AS ENUM ('PORTAL_CLIENT', 'SUPPORT', 'APPROVAL', 'REQUEST', 'FILE', 'FINANCE', 'SCHEDULE', 'CONTACT');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FileOrigin" AS ENUM ('CLIENT', 'ATELIUX', 'SYSTEM', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FinanceStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('ACTIVE', 'NEW', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "ContactLeadStatus" AS ENUM ('NEW', 'IN_REVIEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('CLIENT', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "plan" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'INVITED',
    "responsibleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAccount" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inviteStatus" "AccountStatus" NOT NULL DEFAULT 'INVITED',
    "lastAccessAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "currentStage" TEXT,
    "visibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectStage" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'DRAFT',
    "clientStatus" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "sentToClientAt" TIMESTAMP(3),
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT NOT NULL,
    "questions" JSONB,
    "status" "BriefingStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "VisibilityStatus" NOT NULL DEFAULT 'INTERNAL',
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingResponse" (
    "id" TEXT NOT NULL,
    "briefingId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BriefingResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "previewId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "clientComment" TEXT,
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preview" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "PreviewStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "inboxConversationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "inboxConversationId" TEXT,
    "contactLeadId" TEXT,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "InboxStatus" NOT NULL DEFAULT 'NEW',
    "lastMessage" TEXT,
    "source" "InboxSource" NOT NULL DEFAULT 'SUPPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxConversation" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "channel" "InboxChannel" NOT NULL,
    "status" "InboxStatus" NOT NULL DEFAULT 'NEW',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "source" "InboxSource" NOT NULL,
    "subject" TEXT NOT NULL,
    "preview" TEXT,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "messageId" TEXT,
    "uploadedById" TEXT,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "origin" "FileOrigin" NOT NULL DEFAULT 'SYSTEM',
    "visibility" "VisibilityStatus" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "responsible" TEXT,
    "notes" TEXT,
    "visibility" "VisibilityStatus" NOT NULL DEFAULT 'INTERNAL',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceRecord" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "receiptFileId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "FinanceStatus" NOT NULL DEFAULT 'PENDING',
    "installment" TEXT,
    "visibleToClient" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "authorId" TEXT,
    "coverFileId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "readTime" TEXT,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "origin" TEXT,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'NEW',
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactLead" (
    "id" TEXT NOT NULL,
    "inboxConversationId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "projectType" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "currentSite" TEXT,
    "skills" TEXT,
    "message" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'site',
    "status" "ContactLeadStatus" NOT NULL DEFAULT 'NEW',
    "responsibleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT,
    "audience" "NotificationAudience" NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "clientId" TEXT,
    "projectId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_userId_key" ON "AdminUser"("userId");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE INDEX "Client_responsibleId_idx" ON "Client"("responsibleId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_clientId_key" ON "ClientAccount"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_userId_key" ON "ClientAccount"("userId");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_managerId_idx" ON "Project"("managerId");

-- CreateIndex
CREATE INDEX "ProjectStage_clientId_idx" ON "ProjectStage"("clientId");

-- CreateIndex
CREATE INDEX "ProjectStage_projectId_idx" ON "ProjectStage"("projectId");

-- CreateIndex
CREATE INDEX "ProjectStage_status_idx" ON "ProjectStage"("status");

-- CreateIndex
CREATE INDEX "Briefing_clientId_idx" ON "Briefing"("clientId");

-- CreateIndex
CREATE INDEX "Briefing_projectId_idx" ON "Briefing"("projectId");

-- CreateIndex
CREATE INDEX "Briefing_status_idx" ON "Briefing"("status");

-- CreateIndex
CREATE INDEX "BriefingResponse_briefingId_idx" ON "BriefingResponse"("briefingId");

-- CreateIndex
CREATE INDEX "BriefingResponse_clientId_idx" ON "BriefingResponse"("clientId");

-- CreateIndex
CREATE INDEX "BriefingResponse_projectId_idx" ON "BriefingResponse"("projectId");

-- CreateIndex
CREATE INDEX "Approval_clientId_idx" ON "Approval"("clientId");

-- CreateIndex
CREATE INDEX "Approval_projectId_idx" ON "Approval"("projectId");

-- CreateIndex
CREATE INDEX "Approval_previewId_idx" ON "Approval"("previewId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE INDEX "Preview_clientId_idx" ON "Preview"("clientId");

-- CreateIndex
CREATE INDEX "Preview_projectId_idx" ON "Preview"("projectId");

-- CreateIndex
CREATE INDEX "Preview_status_idx" ON "Preview"("status");

-- CreateIndex
CREATE INDEX "ClientRequest_clientId_idx" ON "ClientRequest"("clientId");

-- CreateIndex
CREATE INDEX "ClientRequest_projectId_idx" ON "ClientRequest"("projectId");

-- CreateIndex
CREATE INDEX "ClientRequest_status_idx" ON "ClientRequest"("status");

-- CreateIndex
CREATE INDEX "ClientRequest_priority_idx" ON "ClientRequest"("priority");

-- CreateIndex
CREATE INDEX "SupportTicket_clientId_idx" ON "SupportTicket"("clientId");

-- CreateIndex
CREATE INDEX "SupportTicket_projectId_idx" ON "SupportTicket"("projectId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE INDEX "InboxConversation_clientId_idx" ON "InboxConversation"("clientId");

-- CreateIndex
CREATE INDEX "InboxConversation_projectId_idx" ON "InboxConversation"("projectId");

-- CreateIndex
CREATE INDEX "InboxConversation_channel_idx" ON "InboxConversation"("channel");

-- CreateIndex
CREATE INDEX "InboxConversation_status_idx" ON "InboxConversation"("status");

-- CreateIndex
CREATE INDEX "InboxConversation_priority_idx" ON "InboxConversation"("priority");

-- CreateIndex
CREATE INDEX "InboxMessage_conversationId_idx" ON "InboxMessage"("conversationId");

-- CreateIndex
CREATE INDEX "InboxMessage_senderId_idx" ON "InboxMessage"("senderId");

-- CreateIndex
CREATE INDEX "FileAsset_clientId_idx" ON "FileAsset"("clientId");

-- CreateIndex
CREATE INDEX "FileAsset_projectId_idx" ON "FileAsset"("projectId");

-- CreateIndex
CREATE INDEX "FileAsset_messageId_idx" ON "FileAsset"("messageId");

-- CreateIndex
CREATE INDEX "FileAsset_visibility_idx" ON "FileAsset"("visibility");

-- CreateIndex
CREATE INDEX "ScheduleEvent_clientId_idx" ON "ScheduleEvent"("clientId");

-- CreateIndex
CREATE INDEX "ScheduleEvent_projectId_idx" ON "ScheduleEvent"("projectId");

-- CreateIndex
CREATE INDEX "ScheduleEvent_date_idx" ON "ScheduleEvent"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceRecord_receiptFileId_key" ON "FinanceRecord"("receiptFileId");

-- CreateIndex
CREATE INDEX "FinanceRecord_clientId_idx" ON "FinanceRecord"("clientId");

-- CreateIndex
CREATE INDEX "FinanceRecord_projectId_idx" ON "FinanceRecord"("projectId");

-- CreateIndex
CREATE INDEX "FinanceRecord_status_idx" ON "FinanceRecord"("status");

-- CreateIndex
CREATE INDEX "FinanceRecord_dueDate_idx" ON "FinanceRecord"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ContactLead_inboxConversationId_key" ON "ContactLead"("inboxConversationId");

-- CreateIndex
CREATE INDEX "ContactLead_email_idx" ON "ContactLead"("email");

-- CreateIndex
CREATE INDEX "ContactLead_status_idx" ON "ContactLead"("status");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_audience_idx" ON "Notification"("audience");

-- CreateIndex
CREATE INDEX "Notification_clientId_idx" ON "Notification"("clientId");

-- CreateIndex
CREATE INDEX "Notification_projectId_idx" ON "Notification"("projectId");

-- CreateIndex
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_clientId_idx" ON "AuditLog"("clientId");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_idx" ON "AuditLog"("projectId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAccount" ADD CONSTRAINT "ClientAccount_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAccount" ADD CONSTRAINT "ClientAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStage" ADD CONSTRAINT "ProjectStage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStage" ADD CONSTRAINT "ProjectStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingResponse" ADD CONSTRAINT "BriefingResponse_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingResponse" ADD CONSTRAINT "BriefingResponse_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingResponse" ADD CONSTRAINT "BriefingResponse_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_previewId_fkey" FOREIGN KEY ("previewId") REFERENCES "Preview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preview" ADD CONSTRAINT "Preview_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preview" ADD CONSTRAINT "Preview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_inboxConversationId_fkey" FOREIGN KEY ("inboxConversationId") REFERENCES "InboxConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_inboxConversationId_fkey" FOREIGN KEY ("inboxConversationId") REFERENCES "InboxConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxConversation" ADD CONSTRAINT "InboxConversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxConversation" ADD CONSTRAINT "InboxConversation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxConversation" ADD CONSTRAINT "InboxConversation_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "InboxConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboxMessage" ADD CONSTRAINT "InboxMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "InboxMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceRecord" ADD CONSTRAINT "FinanceRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceRecord" ADD CONSTRAINT "FinanceRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceRecord" ADD CONSTRAINT "FinanceRecord_receiptFileId_fkey" FOREIGN KEY ("receiptFileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_coverFileId_fkey" FOREIGN KEY ("coverFileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLead" ADD CONSTRAINT "ContactLead_inboxConversationId_fkey" FOREIGN KEY ("inboxConversationId") REFERENCES "InboxConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
