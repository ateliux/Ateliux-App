import { expect, type APIRequestContext } from "@playwright/test";

export type E2EClient = {
  id: string;
  email: string;
  password: string;
  name: string;
  company: string;
};

export type E2EProjectInput = {
  name: string;
  visibleToClient: boolean;
  progress: number;
  currentStage: string;
  deadline: string;
  summary: string;
  scope: string;
};

export function createRunId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createE2EClient(api: APIRequestContext, runId: string): Promise<E2EClient> {
  const email = `e2e-client-${runId}@ateliux.test`;
  const password = process.env.E2E_CLIENT_PASSWORD || `E2EClient@${runId}A1`;
  const name = `E2E Cliente ${runId}`;
  const company = `E2E Empresa ${runId}`;

  const response = await api.post("auth/client/register", {
    data: {
      name,
      email,
      password,
      company,
      phone: "11988887777",
      plan: "Enterprise",
      acceptTerms: true,
      acceptPrivacy: true,
      marketingOptIn: false,
      termsVersion: "e2e-terms",
      privacyVersion: "e2e-privacy",
    },
    headers: {
      "X-Ateliux-Auth-Scope": "client",
    },
  });

  expect(response.ok(), `client register failed with ${response.status()}`).toBeTruthy();

  const me = await api.get("auth/client/me", {
    headers: {
      "X-Ateliux-Auth-Scope": "client",
    },
  });
  expect(me.ok(), `client me failed with ${me.status()}`).toBeTruthy();
  const body = (await me.json()) as { client?: { id?: string } };
  const id = body.client?.id;
  if (!id) throw new Error("Client session did not return client.id.");

  return { id, email, password, name, company };
}

export async function listAdminClientProjects(api: APIRequestContext, clientId: string) {
  const response = await api.get(`admin/clients/${clientId}/projects`, {
    headers: {
      "X-Ateliux-Auth-Scope": "admin",
    },
  });
  expect(response.ok(), `admin client projects failed with ${response.status()}`).toBeTruthy();
  return (await response.json()) as Array<Record<string, unknown>>;
}

export async function listClientProjects(api: APIRequestContext) {
  const response = await api.get("client/projects", {
    headers: {
      "X-Ateliux-Auth-Scope": "client",
    },
  });
  expect(response.ok(), `client projects failed with ${response.status()}`).toBeTruthy();
  return (await response.json()) as Array<Record<string, unknown>>;
}
