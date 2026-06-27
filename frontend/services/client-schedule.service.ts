import { apiRequest } from "@/lib/api/client";

export function listClientSchedule<T = unknown>() {
  return apiRequest<T[]>("/client/schedule");
}
