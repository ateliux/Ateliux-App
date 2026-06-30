import { apiRequest } from "@/lib/api/client";
import type { AdminFileAsset } from "./admin-files.service";

export type AdminBlogPostStatusDto = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

export type BlogTagDto = {
  id: string;
  name: string;
  slug: string;
};

export type AdminBlogPostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: AdminBlogPostStatusDto;
  readTime?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  categoryId?: string | null;
  category?: BlogTagDto | null;
  coverFileId?: string | null;
  coverFile?: AdminFileAsset | null;
  heroImageFileId?: string | null;
  heroImageFile?: AdminFileAsset | null;
  insightTitle?: string | null;
  insightDescription?: string | null;
  insightCtaLabel?: string | null;
  insightCtaHref?: string | null;
  contextTitle?: string | null;
  contextContent?: string | null;
  practicalTitle?: string | null;
  practicalContent?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  _count?: {
    comments?: number;
    savedBy?: number;
    shares?: number;
  };
};

export type AdminBlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: AdminBlogPostStatusDto;
  readTime?: string;
  categoryId?: string | null;
  coverFileId?: string | null;
  heroImageFileId?: string | null;
  scheduledAt?: string;
  insightTitle?: string;
  insightDescription?: string;
  insightCtaLabel?: string;
  insightCtaHref?: string;
  contextTitle?: string;
  contextContent?: string;
  practicalTitle?: string;
  practicalContent?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type AdminBlogCommentDto = {
  id: string;
  postId: string;
  userId: string;
  body: string;
  status: "PUBLISHED" | "DELETED";
  createdAt: string;
  deletedAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    clientAccount?: {
      client?: {
        id: string;
        name: string;
        company: string;
        email: string;
      } | null;
    } | null;
  };
};

export function listAdminBlogPosts() {
  return apiRequest<AdminBlogPostDto[]>("/admin/blog/posts");
}

export function getAdminBlogPost(id: string) {
  return apiRequest<AdminBlogPostDto>(`/admin/blog/posts/${id}`);
}

export function createAdminBlogPost(input: AdminBlogPostInput) {
  return apiRequest<AdminBlogPostDto>("/admin/blog/posts", {
    method: "POST",
    json: input,
  });
}

export function updateAdminBlogPost(id: string, input: Partial<AdminBlogPostInput>) {
  return apiRequest<AdminBlogPostDto>(`/admin/blog/posts/${id}`, {
    method: "PATCH",
    json: input,
  });
}

export function deleteAdminBlogPost(id: string) {
  return apiRequest<{ success: boolean }>(`/admin/blog/posts/${id}`, {
    method: "DELETE",
  });
}

export function publishAdminBlogPost(id: string) {
  return apiRequest<AdminBlogPostDto>(`/admin/blog/posts/${id}/publish`, { method: "POST" });
}

export function unpublishAdminBlogPost(id: string) {
  return apiRequest<AdminBlogPostDto>(`/admin/blog/posts/${id}/unpublish`, { method: "POST" });
}

export function archiveAdminBlogPost(id: string) {
  return apiRequest<AdminBlogPostDto>(`/admin/blog/posts/${id}/archive`, { method: "POST" });
}

export function listAdminBlogTags() {
  return apiRequest<BlogTagDto[]>("/admin/blog/tags");
}

export function createAdminBlogTag(input: { name: string; slug: string }) {
  return apiRequest<BlogTagDto>("/admin/blog/tags", {
    method: "POST",
    json: input,
  });
}

export function updateAdminBlogTag(id: string, input: Partial<{ name: string; slug: string }>) {
  return apiRequest<BlogTagDto>(`/admin/blog/tags/${id}`, {
    method: "PATCH",
    json: input,
  });
}

export function deleteAdminBlogTag(id: string) {
  return apiRequest<{ success: boolean }>(`/admin/blog/tags/${id}`, { method: "DELETE" });
}

export function listAdminBlogComments(postId: string) {
  return apiRequest<AdminBlogCommentDto[]>(`/admin/blog/posts/${postId}/comments`);
}

export function deleteAdminBlogComment(id: string) {
  return apiRequest<AdminBlogCommentDto>(`/admin/blog/comments/${id}`, { method: "DELETE" });
}
