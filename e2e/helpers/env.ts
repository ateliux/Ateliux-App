import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(__dirname, "../..");

export type E2EEnv = {
  apiUrl: string;
  adminUrl: string;
  frontendUrl: string;
  adminEmail: string;
  adminPassword: string;
};

function parseEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const separator = trimmed.indexOf("=");
  if (separator === -1) return null;
  const key = trimmed.slice(0, separator).trim();
  let value = trimmed.slice(separator + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return key ? { key, value } : null;
}

function loadEnvFile(relativePath: string) {
  const filePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (parsed && process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value;
    }
  }
}

export function loadE2EEnvFiles() {
  loadEnvFile(".env.e2e");
  loadEnvFile("backend/.env");
}

function required(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`Missing required E2E env: ${name}`);
  }
  return value.trim();
}

function isLocalUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function withoutTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function withTrailingSlash(value: string) {
  return `${withoutTrailingSlash(value)}/`;
}

export function getE2EEnv(): E2EEnv {
  const apiUrl = withTrailingSlash(process.env.E2E_BASE_API_URL || "http://localhost:3001/api");
  const adminUrl = withoutTrailingSlash(process.env.E2E_ADMIN_URL || "http://localhost:3002");
  const frontendUrl = withoutTrailingSlash(process.env.E2E_FRONTEND_URL || "http://localhost:3000");
  const targetEnv = (process.env.E2E_TARGET_ENV || "local").toLowerCase();
  const allowNonLocal = process.env.E2E_ALLOW_NON_LOCAL === "true";
  const allowProduction = process.env.E2E_ALLOW_PRODUCTION === "true";
  const isLocalTarget = [apiUrl, adminUrl, frontendUrl].every((url) => isLocalUrl(url));
  const isProductionTarget =
    targetEnv === "production" ||
    process.env.NODE_ENV === "production" ||
    process.env.E2E_IS_PRODUCTION === "true";

  if (isProductionTarget && !allowProduction) {
    throw new Error("E2E production target is blocked unless E2E_ALLOW_PRODUCTION=true.");
  }

  if (!allowNonLocal && !isLocalTarget) {
    throw new Error("E2E target URLs must be localhost unless E2E_ALLOW_NON_LOCAL=true.");
  }

  if (!isLocalTarget && !process.env.E2E_CLIENT_PASSWORD?.trim()) {
    throw new Error("Missing required E2E env for non-local target: E2E_CLIENT_PASSWORD.");
  }

  return {
    apiUrl,
    adminUrl,
    frontendUrl,
    adminEmail: required("E2E_ADMIN_EMAIL or BOOTSTRAP_ADMIN_EMAIL", process.env.E2E_ADMIN_EMAIL || process.env.BOOTSTRAP_ADMIN_EMAIL),
    adminPassword: required(
      "E2E_ADMIN_PASSWORD or BOOTSTRAP_ADMIN_PASSWORD",
      process.env.E2E_ADMIN_PASSWORD || process.env.BOOTSTRAP_ADMIN_PASSWORD,
    ),
  };
}
