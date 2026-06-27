import { apiRequest } from "@/lib/api/client";

export function listClientProjects<T = unknown>() {
  return apiRequest<T[]>("/client/projects");
}

export function getClientProject<T = unknown>(id: string) {
  return apiRequest<T>(`/client/projects/${id}`);
}
