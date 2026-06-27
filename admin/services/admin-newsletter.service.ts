import { apiRequest } from "@/lib/api/client";

export type NewsletterStatusDto = "ACTIVE" | "NEW" | "UNSUBSCRIBED";

export type NewsletterSubscriberDto = {
  id: string;
  email: string;
  name?: string | null;
  origin?: string | null;
  status: NewsletterStatusDto;
  interests: string[];
  createdAt: string;
};

export function listNewsletterSubscribers() {
  return apiRequest<NewsletterSubscriberDto[]>("/admin/newsletter/subscribers");
}

export function updateNewsletterSubscriber(id: string, input: Partial<Pick<NewsletterSubscriberDto, "name" | "origin" | "status" | "interests">>) {
  return apiRequest<NewsletterSubscriberDto>(`/admin/newsletter/subscribers/${id}`, {
    method: "PATCH",
    json: input,
  });
}

export function deleteNewsletterSubscriber(id: string) {
  return apiRequest<{ success: boolean }>(`/admin/newsletter/subscribers/${id}`, {
    method: "DELETE",
  });
}

export function exportNewsletterSubscribers() {
  return apiRequest<{ csv?: string; url?: string }>("/admin/newsletter/subscribers/export");
}
