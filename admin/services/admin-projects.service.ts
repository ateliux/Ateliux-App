import { apiRequest } from "@/lib/api/client";

export function listAdminClientProjects<T = unknown>(clientId: string) {
  return apiRequest<T[]>(`/admin/clients/${clientId}/projects`);
}

export function getAdminProject<T = unknown>(id: string) {
  return apiRequest<T>(`/admin/projects/${id}`);
}

export function createAdminProject<T = unknown>(input: unknown) {
  return apiRequest<T>("/admin/projects", { method: "POST", json: input });
}

export function updateAdminProject<T = unknown>(id: string, input: unknown) {
  return apiRequest<T>(`/admin/projects/${id}`, { method: "PATCH", json: input });
}

export function deleteAdminProject(id: string) {
  return apiRequest<{ success: boolean }>(`/admin/projects/${id}`, { method: "DELETE" });
}
