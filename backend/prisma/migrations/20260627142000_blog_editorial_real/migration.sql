-- Blog editorial module: real tags, images, comments, saved posts and shares.

ALTER TYPE "FileContext" ADD VALUE IF NOT EXISTS 'BLOG_HERO';

CREATE TYPE "BlogCommentStatus" AS ENUM ('PUBLISHED', 'DELETED');

ALTER TABLE "BlogPost"
  ADD COLUMN "heroImageFileId" TEXT,
  ADD COLUMN "insightTitle" TEXT,
  ADD COLUMN "insightDescription" TEXT,
  ADD COLUMN "insightCtaLabel" TEXT,
  ADD COLUMN "insightCtaHref" TEXT,
  ADD COLUMN "contextTitle" TEXT,
  ADD COLUMN "contextContent" TEXT,
  ADD COLUMN "practicalTitle" TEXT,
  ADD COLUMN "practicalContent" TEXT,
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT;

ALTER TABLE "BlogPost"
  ADD CONSTRAINT "BlogPost_heroImageFileId_fkey"
  FOREIGN KEY ("heroImageFileId") REFERENCES "FileAsset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "BlogComment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "BlogCommentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedBlogPost" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedBlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogShare" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT,
  "channel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlogShare_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BlogPost_coverFileId_idx" ON "BlogPost"("coverFileId");
CREATE INDEX "BlogPost_heroImageFileId_idx" ON "BlogPost"("heroImageFileId");

CREATE INDEX "BlogComment_postId_idx" ON "BlogComment"("postId");
CREATE INDEX "BlogComment_userId_idx" ON "BlogComment"("userId");
CREATE INDEX "BlogComment_status_idx" ON "BlogComment"("status");
CREATE INDEX "BlogComment_deletedAt_idx" ON "BlogComment"("deletedAt");

CREATE UNIQUE INDEX "SavedBlogPost_userId_postId_key" ON "SavedBlogPost"("userId", "postId");
CREATE INDEX "SavedBlogPost_userId_idx" ON "SavedBlogPost"("userId");
CREATE INDEX "SavedBlogPost_postId_idx" ON "SavedBlogPost"("postId");

CREATE INDEX "BlogShare_postId_idx" ON "BlogShare"("postId");
CREATE INDEX "BlogShare_userId_idx" ON "BlogShare"("userId");

ALTER TABLE "BlogComment"
  ADD CONSTRAINT "BlogComment_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "BlogPost"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlogComment"
  ADD CONSTRAINT "BlogComment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedBlogPost"
  ADD CONSTRAINT "SavedBlogPost_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedBlogPost"
  ADD CONSTRAINT "SavedBlogPost_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "BlogPost"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlogShare"
  ADD CONSTRAINT "BlogShare_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "BlogPost"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlogShare"
  ADD CONSTRAINT "BlogShare_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
