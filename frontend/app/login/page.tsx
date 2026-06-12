import type { Metadata } from "next";
import { AuthPage } from "../../components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Login — Ateliux",
  description: "Acesse sua conta Ateliux para acompanhar projetos digitais.",
};

export default function LoginRoute() {
  return <AuthPage mode="login" />;
}