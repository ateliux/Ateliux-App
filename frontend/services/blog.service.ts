import { apiRequest } from "@/lib/api/client";

export type BlogCategoryDto = {
  id: string;
  name: string;
  slug: string;
};

export type BlogFileDto = {
  id: string;
  secureUrl?: string | null;
  url?: string | null;
  originalName?: string | null;
};

export type BlogAuthorDto = {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export type BlogPostDto = {
  id: string;
  categoryId?: string | null;
  coverFileId?: string | null;
  heroImageFileId?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  readTime?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  category?: BlogCategoryDto | null;
  tag?: BlogCategoryDto | null;
  coverFile?: BlogFileDto | null;
  heroImageFile?: BlogFileDto | null;
  coverUrl?: string | null;
  coverImageUrl?: string | null;
  heroImageUrl?: string | null;
  authorDisplayName?: "Equipe Ateliux" | string | null;
  author?: BlogAuthorDto | null;
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
  savedAt?: string | null;
  _count?: {
    comments?: number;
    shares?: number;
    savedBy?: number;
  };
};

export type BlogCommentDto = {
  id: string;
  body: string;
  status: "PUBLISHED" | "DELETED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    clientAccount?: {
      client?: {
        company?: string | null;
      } | null;
    } | null;
  };
};

export type ShareBlogPostResponse = {
  success: boolean;
  id: string;
  count: number;
};

export type BlogSavedStatusResponse = {
  saved: boolean;
};

export type BlogMessageThreadResponse = {
  conversationId: string;
  href: string;
  subject: string;
};

export function listPublishedBlogPosts() {
  return apiRequest<BlogPostDto[]>("/blog/posts");
}

export function getPublishedBlogPost(slug: string) {
  return apiRequest<BlogPostDto>(`/blog/posts/${slug}`);
}

export function listBlogCategories() {
  return apiRequest<BlogCategoryDto[]>("/blog/categories");
}

export function listBlogTags() {
  return apiRequest<BlogCategoryDto[]>("/blog/tags");
}

export function listBlogComments(slug: string) {
  return apiRequest<BlogCommentDto[]>(`/blog/posts/${slug}/comments`);
}

export function createBlogComment(postId: string, body: string) {
  return apiRequest<BlogCommentDto>(`/client/blog/posts/${postId}/comments`, {
    method: "POST",
    json: { body },
  });
}

export function getBlogSavedStatus(postId: string) {
  return apiRequest<BlogSavedStatusResponse>(`/client/blog/posts/${postId}/saved-status`);
}

export function saveBlogPost(postId: string) {
  return apiRequest<BlogSavedStatusResponse>(`/client/blog/posts/${postId}/save`, {
    method: "POST",
  });
}

export function unsaveBlogPost(postId: string) {
  return apiRequest<BlogSavedStatusResponse>(`/client/blog/posts/${postId}/save`, {
    method: "DELETE",
  });
}

export function listSavedBlogPosts() {
  return apiRequest<BlogPostDto[]>("/client/blog/saved");
}

export function shareBlogPost(postId: string, channel: string) {
  return apiRequest<ShareBlogPostResponse>(`/blog/posts/${postId}/share`, {
    method: "POST",
    json: { channel },
  });
}

export function createBlogMessageThread(postId: string) {
  return apiRequest<BlogMessageThreadResponse>(`/client/blog/posts/${postId}/message-thread`, {
    method: "POST",
  });
}
