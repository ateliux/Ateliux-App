import { apiRequest } from "@/lib/api/client";
import type { AdminClient, ClientAccountStatus, ClientStatus } from "@/types/admin";

type ApiAccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "ARCHIVED";

type ApiClient = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  plan: string;
  status: ApiAccountStatus;
  updatedAt?: string;
  responsible?: { user?: { name?: string | null } | null } | null;
  account?: { inviteStatus?: ApiAccountStatus; lastAccessAt?: string | null } | null;
  projects?: Array<{ id: string; name: string; status?: string; progress?: number; updatedAt?: string }>;
};

export type AdminClientsResult = {
  clients: AdminClient[];
  source: "api" | "mock";
};

const planMap = new Set(["Essencial", "Profissional", "Enterprise"]);

function mapStatus(status: ApiAccountStatus): ClientStatus {
  if (status === "ARCHIVED" || status === "SUSPENDED") return "inativo";
  return "novo";
}

function mapAccountStatus(status?: ApiAccountStatus): ClientAccountStatus {
  if (status === "ACTIVE") return "Ativa";
  if (status === "ARCHIVED" || status === "SUSPENDED") return "Inativa";
  return "Aguardando convite";
}

function formatDate(value?: string | null) {
  if (!value) return "Nunca acessou";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function mapApiClient(client: ApiClient): AdminClient {
  const project = client.projects?.[0];
  return {
    id: client.id,
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone ?? "",
    project: project?.name ?? "Sem projeto vinculado",
    plan: planMap.has(client.plan) ? (client.plan as AdminClient["plan"]) : "Essencial",
    status: mapStatus(client.status),
    progress: project?.progress ?? 0,
    responsible: client.responsible?.user?.name ?? "Equipe Ateliux",
    lastUpdate: project?.updatedAt ? formatDate(project.updatedAt) : "Cadastro atualizado",
    lastAccess: formatDate(client.account?.lastAccessAt),
    accountStatus: mapAccountStatus(client.account?.inviteStatus ?? client.status),
    linkedProject: project?.id,
    notes: "",
  };
}

export async function listAdminClients() {
  const clients = await apiRequest<ApiClient[]>("/admin/clients");
  return clients.map(mapApiClient);
}

export async function getAdminClient(id: string | number) {
  const client = await apiRequest<ApiClient>(`/admin/clients/${id}`);
  return mapApiClient(client);
}

export async function createAdminClient(input: Pick<AdminClient, "name" | "company" | "email" | "phone" | "plan">) {
  const client = await apiRequest<ApiClient>("/admin/clients", {
    method: "POST",
    json: {
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone || undefined,
      plan: input.plan,
    },
  });
  return mapApiClient(client);
}

export async function updateAdminClient(id: string | number, input: Pick<AdminClient, "name" | "company" | "email" | "phone" | "plan">) {
  const client = await apiRequest<ApiClient>(`/admin/clients/${id}`, {
    method: "PATCH",
    json: {
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone || undefined,
      plan: input.plan,
    },
  });
  return mapApiClient(client);
}

export function deleteAdminClient(id: string | number) {
  return apiRequest<{ success: boolean }>(`/admin/clients/${id}`, { method: "DELETE" });
}

export async function updateAdminClientStatus(id: string | number, status: ApiAccountStatus) {
  const client = await apiRequest<ApiClient>(`/admin/clients/${id}/status`, {
    method: "PATCH",
    json: { status },
  });
  return mapApiClient(client);
}

export function inviteAdminClient(id: string | number) {
  return apiRequest<{ success: boolean }>(`/admin/clients/${id}/invite`, { method: "POST" });
}
