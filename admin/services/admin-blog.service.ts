import { apiRequest } from "@/lib/api/client";

export type AdminBlogPostStatusDto = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

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
  category?: { id: string; name: string; slug: string } | null;
};

export type AdminBlogPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: AdminBlogPostStatusDto;
  readTime?: string;
  categoryId?: string;
  coverFileId?: string;
  scheduledAt?: string;
};

export function listAdminBlogPosts() {
  return apiRequest<AdminBlogPostDto[]>("/admin/blog/posts");
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
