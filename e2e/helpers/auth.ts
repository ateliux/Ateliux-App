import { expect, type APIRequestContext, type Page } from "@playwright/test";
import type { E2EEnv } from "./env";
import { adminLoginUrl, clientLoginUrl } from "./routes";

export type AdminSession = {
  adminId: string;
  userName: string;
};

export async function loginAdminByApi(api: APIRequestContext, env: E2EEnv): Promise<AdminSession> {
  const response = await api.post("auth/admin/login", {
    data: {
      email: env.adminEmail,
      password: env.adminPassword,
    },
    headers: {
      "X-Ateliux-Auth-Scope": "admin",
    },
  });
  expect(response.ok(), `admin API login failed with ${response.status()}`).toBeTruthy();
  const body = (await response.json()) as { admin?: { id?: string }; user?: { name?: string } };
  const adminId = body.admin?.id;
  if (!adminId) throw new Error("Admin login response did not include admin.id.");
  return {
    adminId,
    userName: body.user?.name ?? "Admin Ateliux",
  };
}

export async function loginAdminInBrowser(page: Page, env: E2EEnv) {
  await page.goto(adminLoginUrl(env), { waitUntil: "networkidle" });
  const loginButton = page.getByRole("button", { name: /Acessar dashboard/i });
  if (await loginButton.isVisible().catch(() => false)) {
    await page.getByLabel(/E-mail administrativo/i).fill(env.adminEmail);
    await page.getByLabel(/Senha/i).fill(env.adminPassword);
    const [response] = await Promise.all([
      page.waitForResponse((item) => item.url().includes("/api/auth/admin/login") && item.request().method() === "POST"),
      loginButton.click(),
    ]);
    expect(response.ok(), `admin browser login failed with ${response.status()}`).toBeTruthy();
    await expect(page).not.toHaveURL(adminLoginUrl(env));
  }
}

export async function loginClientInBrowser(page: Page, env: E2EEnv, email: string, password: string) {
  await page.goto(clientLoginUrl(env), { waitUntil: "networkidle" });
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(email);
    await page.locator('input[type="password"], input[name="password"]').first().fill(password);
    const [response] = await Promise.all([
      page.waitForResponse((item) => item.url().includes("/api/auth/client/login") && item.request().method() === "POST"),
      page.getByRole("button", { name: /^Entrar$|Acessar|Login/i }).first().click(),
    ]);
    expect(response.ok(), `client browser login failed with ${response.status()}`).toBeTruthy();
    await page.waitForLoadState("networkidle").catch(() => undefined);
  }
}
