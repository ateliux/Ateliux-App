import { apiRequest } from "@/lib/api/client";

export function listClientBriefings<T = unknown>() {
  return apiRequest<T[]>("/client/briefings");
}

export function getClientBriefing<T = unknown>(id: string) {
  return apiRequest<T>(`/client/briefings/${id}`);
}

export function submitClientBriefingResponse<T = unknown>(id: string, answers: unknown) {
  return apiRequest<T>(`/client/briefings/${id}/response`, {
    method: "POST",
    json: { answers },
  });
}
