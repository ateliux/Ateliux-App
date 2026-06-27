import { apiRequest } from "@/lib/api/client";

export function listClientTeam<T = unknown>() {
  return apiRequest<T[]>("/client/team");
}
