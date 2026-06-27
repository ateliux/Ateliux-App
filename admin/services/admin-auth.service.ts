import { apiRequest } from "@/lib/api/client";

export type AdminAuthUser = {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  adminRole?: string;
};

export type AdminProfile = {
  id: string;
  userId: string;
  role: string;
  avatarUrl?: string | null;
};

export type AdminAuthSession = {
  user: AdminAuthUser;
  admin?: AdminProfile | null;
};

export type AdminLoginInput = {
  email: string;
  password: string;
};

export function loginAdmin(input: AdminLoginInput) {
  return apiRequest<AdminAuthSession>("/auth/admin/login", {
    method: "POST",
    json: input,
  });
}

export function logoutAdmin() {
  return apiRequest<{ success: boolean }>("/auth/admin/logout", {
    method: "POST",
  });
}

export function getAdminSession() {
  return apiRequest<AdminAuthSession>("/auth/admin/me");
}
