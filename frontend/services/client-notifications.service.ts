import { apiRequest } from "@/lib/api/client";

export function listClientNotifications<T = unknown>() {
  return apiRequest<T[]>("/client/notifications");
}

export function markClientNotificationRead<T = unknown>(id: string) {
  return apiRequest<T>(`/client/notifications/${id}/read`, {
    method: "PATCH",
  });
}
