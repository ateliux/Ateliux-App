import type { E2EEnv } from "./env";

export function adminLoginUrl(env: E2EEnv) {
  return `${env.adminUrl}/`;
}

export function adminClientsUrl(env: E2EEnv) {
  return `${env.adminUrl}/clientes`;
}

export function adminProjectSetupUrl(env: E2EEnv, clientId: string) {
  return `${env.adminUrl}/portal-do-cliente/projetos?clientId=${encodeURIComponent(clientId)}&create=1`;
}

export function adminProjectWorkspaceUrlPattern(projectId: string) {
  return new RegExp(`/portal-do-cliente/projetos/${projectId}$`);
}

export function clientLoginUrl(env: E2EEnv) {
  return `${env.frontendUrl}/login`;
}

export function clientProjectUrl(env: E2EEnv) {
  return `${env.frontendUrl}/cliente/projeto`;
}
