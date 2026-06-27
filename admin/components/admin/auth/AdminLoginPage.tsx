"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { loginAdmin } from "@/services/admin-auth.service";

export function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Informe e-mail e senha administrativa.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await loginAdmin({ email, password });
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel entrar na admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F6] px-6 py-12 text-[#1E293B]">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B074] text-xl font-bold text-white">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Admin Ateliux</h1>
            <p className="text-sm text-gray-500">Area administrativa interna</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Entrar na dashboard</h2>
          <p className="text-sm leading-relaxed text-gray-500">
            Use sua conta administrativa Ateliux. A sessao e mantida por cookie httpOnly emitido pelo backend.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">E-mail administrativo</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@ateliux.com.br"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-[#00B074] focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">Senha</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-[#00B074] focus:bg-white"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-600" role="alert">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#00B074] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-[#009662] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Acessar dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}
