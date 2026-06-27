import { apiRequest } from "@/lib/api/client";

export function subscribeNewsletter(input: { email: string; name?: string; origin?: string }) {
  return apiRequest<{ id: string }>("/newsletter/subscribe", {
    method: "POST",
    json: input,
  });
}
