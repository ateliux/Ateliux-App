import { apiRequest } from "@/lib/api/client";

export const adminPortalApi = {
  briefings: {
    list: <T = unknown>() => apiRequest<T[]>("/admin/briefings"),
    create: <T = unknown>(input: unknown) => apiRequest<T>("/admin/briefings", { method: "POST", json: input }),
    update: <T = unknown>(id: string, input: unknown) => apiRequest<T>(`/admin/briefings/${id}`, { method: "PATCH", json: input }),
    send: <T = unknown>(id: string) => apiRequest<T>(`/admin/briefings/${id}/send`, { method: "POST" }),
    delete: (id: string) => apiRequest<{ success: boolean }>(`/admin/briefings/${id}`, { method: "DELETE" }),
  },
  stages: {
    list: <T = unknown>() => apiRequest<T[]>("/admin/stages"),
    create: <T = unknown>(input: unknown) => apiRequest<T>("/admin/stages", { method: "POST", json: input }),
    update: <T = unknown>(id: string, input: unknown) => apiRequest<T>(`/admin/stages/${id}`, { method: "PATCH", json: input }),
    sendToClient: <T = unknown>(id: string) => apiRequest<T>(`/admin/stages/${id}/send-to-client`, { method: "POST" }),
    requestApproval: <T = unknown>(id: string) => apiRequest<T>(`/admin/stages/${id}/request-approval`, { method: "POST" }),
    delete: (id: string) => apiRequest<{ success: boolean }>(`/admin/stages/${id}`, { method: "DELETE" }),
  },
  approvals: {
    list: <T = unknown>() => apiRequest<T[]>("/admin/approvals"),
    create: <T = unknown>(input: unknown) => apiRequest<T>("/admin/approvals", { method: "POST", json: input }),
    update: <T = unknown>(id: string, input: unknown) => apiRequest<T>(`/admin/approvals/${id}`, { method: "PATCH", json: input }),
    send: <T = unknown>(id: string) => apiRequest<T>(`/admin/approvals/${id}/send`, { method: "POST" }),
    delete: (id: string) => apiRequest<{ success: boolean }>(`/admin/approvals/${id}`, { method: "DELETE" }),
  },
  previews: {
    list: <T = unknown>() => apiRequest<T[]>("/admin/previews"),
    create: <T = unknown>(input: unknown) => apiRequest<T>("/admin/previews", { method: "POST", json: input }),
    update: <T = unknown>(id: string, input: unknown) => apiRequest<T>(`/admin/previews/${id}`, { method: "PATCH", json: input }),
    sendForApproval: <T = unknown>(id: string) => apiRequest<T>(`/admin/previews/${id}/send-for-approval`, { method: "POST" }),
    delete: (id: string) => apiRequest<{ success: boolean }>(`/admin/previews/${id}`, { method: "DELETE" }),
  },
  schedule: {
    list: <T = unknown>() => apiRequest<T[]>("/admin/schedule"),
    create: <T = unknown>(input: unknown) => apiRequest<T>("/admin/schedule", { method: "POST", json: input }),
    update: <T = unknown>(id: string, input: unknown) => apiRequest<T>(`/admin/schedule/${id}`, { method: "PATCH", json: input }),
    delete: (id: string) => apiRequest<{ success: boolean }>(`/admin/schedule/${id}`, { method: "DELETE" }),
  },
  finance: {
    list: <T = unknown>() => apiRequest<T[]>("/admin/finance"),
    create: <T = unknown>(input: unknown) => apiRequest<T>("/admin/finance", { method: "POST", json: input }),
    update: <T = unknown>(id: string, input: unknown) => apiRequest<T>(`/admin/finance/${id}`, { method: "PATCH", json: input }),
    delete: (id: string) => apiRequest<{ success: boolean }>(`/admin/finance/${id}`, { method: "DELETE" }),
  },
  history: {
    list: <T = unknown>() => apiRequest<T[]>("/admin/history"),
    createManualNote: <T = unknown>(input: unknown) => apiRequest<T>("/admin/history/manual-note", { method: "POST", json: input }),
  },
};
