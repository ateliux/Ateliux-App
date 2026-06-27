import { normalizeApiError } from "./api-error";
import type { ApiRequestInit } from "./api-types";

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

export function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { json, ...requestInit } = init;
  const body = json === undefined ? requestInit.body : JSON.stringify(json);
  const headers = new Headers(requestInit.headers);
  const isFormData = body instanceof FormData;

  if (body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...requestInit,
    body,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw await normalizeApiError(response);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
