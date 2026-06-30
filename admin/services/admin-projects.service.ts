import { apiRequest } from "@/lib/api/client";

export type AdminUserOption = {
  id: string;
  role: string;
  avatarUrl?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type ProjectFullSetupInput = {
  clientId: string;
  name: string;
  type: string;
  scope: string;
  description: string;
  status: string;
  priority: string;
  managerId: string;
  teamIds?: string[];
  startDate?: string;
  deadline: string;
  visibleToClient: boolean;
  currentStage: string;
  progress: number;
  clientFacingSummary?: string;
  internalNotes?: string;
  initialBriefing?: {
    title: string;
    description: string;
    visibility?: string;
  };
  initialStages?: Array<{
    title: string;
    description?: string;
    order?: number;
    status?: string;
    requiresApproval?: boolean;
    dueDate?: string;
    visibleToClient?: boolean;
  }>;
  initialScheduleEvents?: Array<{
    title: string;
    type: string;
    date: string;
    time?: string;
    responsible?: string;
    notes?: string;
    visibleToClient?: boolean;
  }>;
  initialFinance?: {
    description: string;
    amount: number;
    dueDate: string;
    installment?: string;
    visibleToClient?: boolean;
  };
};

export function listAdminUsers() {
  return apiRequest<AdminUserOption[]>("/admin/users");
}

export function listAdminClientProjects<T = unknown>(clientId: string) {
  return apiRequest<T[]>(`/admin/clients/${clientId}/projects`);
}

export function getAdminProject<T = unknown>(id: string) {
  return apiRequest<T>(`/admin/projects/${id}`);
}

export function createAdminProjectFullSetup<T = unknown>(input: ProjectFullSetupInput) {
  return apiRequest<T>("/admin/projects/full-setup", { method: "POST", json: input });
}

export function updateAdminProject<T = unknown>(id: string, input: unknown) {
  return apiRequest<T>(`/admin/projects/${id}`, { method: "PATCH", json: input });
}

export function deleteAdminProject(id: string) {
  return apiRequest<{ success: boolean }>(`/admin/projects/${id}`, { method: "DELETE" });
}
