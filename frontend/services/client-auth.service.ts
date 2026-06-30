import { apiRequest } from "@/lib/api/client";

export type ClientAuthUser = {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  clientId?: string;
};

export type ClientAccount = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  plan?: string;
  status?: string;
};

export type ClientAuthSession = {
  user: ClientAuthUser;
  client?: ClientAccount | null;
};

export type ClientLoginInput = {
  email: string;
  password: string;
};

export type ClientRegisterInput = ClientLoginInput & {
  name: string;
  company: string;
  phone?: string;
  plan?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingOptIn?: boolean;
  termsVersion?: string;
  privacyVersion?: string;
};

export function loginClient(input: ClientLoginInput) {
  return apiRequest<ClientAuthSession>("/auth/client/login", {
    method: "POST",
    json: input,
  });
}

export function registerClient(input: ClientRegisterInput) {
  return apiRequest<ClientAuthSession>("/auth/client/register", {
    method: "POST",
    json: input,
  });
}

export function logoutClient() {
  return apiRequest<{ success: boolean }>("/auth/client/logout", {
    method: "POST",
  });
}

export function getClientSession() {
  return apiRequest<ClientAuthSession>("/auth/client/me");
}
