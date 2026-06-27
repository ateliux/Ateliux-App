import { apiRequest } from "@/lib/api/client";

export function listClientFinance<T = unknown>() {
  return apiRequest<T[]>("/client/finance");
}
