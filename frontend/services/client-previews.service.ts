import { apiRequest } from "@/lib/api/client";

export function listClientPreviews<T = unknown>() {
  return apiRequest<T[]>("/client/previews");
}
