import { apiRequest } from "@/lib/api/client";

export function listClientProjectStages<T = unknown>(projectId: string) {
  return apiRequest<T[]>(`/client/projects/${projectId}/stages`);
}
