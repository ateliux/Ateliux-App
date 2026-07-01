import { apiRequest } from "@/lib/api/client";
import type { AdminClient, ClientAccountStatus, ClientStatus } from "@/types/admin";

type ApiAccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "ARCHIVED";
type ApiClientPipelineStatus = "NEW" | "BRIEFING" | "DESIGN" | "DEVELOPMENT" | "APPROVAL" | "COMPLETED" | "INACTIVE";

type ApiClient = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  plan: string;
  status: ApiAccountStatus;
  pipelineStatus?: ApiClientPipelineStatus | null;
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

const apiPipelineToClientStatus: Record<ApiClientPipelineStatus, ClientStatus> = {
  NEW: "novo",
  BRIEFING: "briefing",
  DESIGN: "design",
  DEVELOPMENT: "desenvolvimento",
  APPROVAL: "aprovacao",
  COMPLETED: "concluido",
  INACTIVE: "inativo",
};

const clientStatusToApiPipeline: Record<ClientStatus, ApiClientPipelineStatus> = {
  novo: "NEW",
  lead: "NEW",
  briefing: "BRIEFING",
  design: "DESIGN",
  desenvolvimento: "DEVELOPMENT",
  aprovacao: "APPROVAL",
  homologacao: "APPROVAL",
  concluido: "COMPLETED",
  publicado: "COMPLETED",
  inativo: "INACTIVE",
};

function mapPipelineStatus(status?: ApiClientPipelineStatus | null): ClientStatus {
  return status ? apiPipelineToClientStatus[status] : "novo";
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
    project: project?.name ?? "Sem projeto real",
    plan: planMap.has(client.plan) ? (client.plan as AdminClient["plan"]) : "Essencial",
    status: mapPipelineStatus(client.pipelineStatus),
    progress: project?.progress ?? 0,
    responsible: client.responsible?.user?.name ?? "Equipe Ateliux",
    lastUpdate: project?.updatedAt ? formatDate(project.updatedAt) : "Cadastro atualizado",
    lastAccess: formatDate(client.account?.lastAccessAt),
    accountStatus: mapAccountStatus(client.account?.inviteStatus ?? client.status),
    projectId: project?.id,
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

type AdminClientIdentityInput = Pick<AdminClient, "name" | "company" | "email" | "phone" | "plan"> & Partial<Pick<AdminClient, "status">>;

export async function createAdminClient(input: AdminClientIdentityInput) {
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

  if (input.status && input.status !== "novo") {
    return updateAdminClientPipelineStatus(client.id, input.status);
  }

  return mapApiClient(client);
}

export async function updateAdminClient(id: string | number, input: AdminClientIdentityInput) {
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

  if (input.status) {
    return updateAdminClientPipelineStatus(id, input.status);
  }

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

export async function updateAdminClientPipelineStatus(id: string | number, status: ClientStatus) {
  const client = await apiRequest<ApiClient>(`/admin/clients/${id}/pipeline-status`, {
    method: "PATCH",
    json: { status: clientStatusToApiPipeline[status] },
  });
  return mapApiClient(client);
}

export function inviteAdminClient(id: string | number) {
  return apiRequest<{ success: boolean }>(`/admin/clients/${id}/invite`, { method: "POST" });
}
