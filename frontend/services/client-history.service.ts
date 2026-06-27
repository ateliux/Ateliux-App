import { apiRequest } from "@/lib/api/client";

export function listClientHistory<T = unknown>() {
  return apiRequest<T[]>("/client/history");
}
