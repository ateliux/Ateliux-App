import type { Metadata } from "next";
import { AuthPage } from "../../components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Criar conta — Ateliux",
  description: "Crie sua conta Ateliux para iniciar seu projeto digital.",
};

export default function CriarContaRoute() {
  return <AuthPage mode="register" />;
}