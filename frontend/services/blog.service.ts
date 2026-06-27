import { apiRequest } from "@/lib/api/client";

export type BlogCategoryDto = {
  id: string;
  name: string;
  slug: string;
};

export type BlogPostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  readTime?: string | null;
  publishedAt?: string | null;
  category?: BlogCategoryDto | null;
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
