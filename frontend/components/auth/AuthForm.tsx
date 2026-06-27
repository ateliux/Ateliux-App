"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authContent } from "../../content/auth";
import { siteRoutes } from "../../data/siteRoutes";
import type { AuthMode } from "./AuthPage";
import { AuthSocialButton } from "./AuthSocialButton";
import { useAuth } from "./MockAuthProvider";
import { MotionButton, MotionContainer, MotionForm, MotionItem } from "../motion";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const content = authContent.forms[mode];
  const shouldShowSocialAuth = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();

    if (!email || !password || (mode === "register" && (!name || !company))) {
      setFormError(
        mode === "register"
          ? "Preencha nome, empresa, e-mail e senha para criar sua conta."
          : "Preencha e-mail e senha para entrar.",
      );
      return;
    }

    setFormError("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        await register({ name, company, email, password });
      } else {
        await login({ email, password });
      }
      router.push(siteRoutes.clientPortal);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel autenticar agora.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative z-10 flex h-full w-full flex-col justify-between p-8 md:min-h-screen md:p-14 lg:p-16">
      <div className="mx-auto mt-10 flex w-full max-w-[420px] flex-1 flex-col justify-center md:mt-0">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-semibold text-white">
            {content.title}
          </h1>

          <p className="text-[13px] leading-relaxed text-[#888888]">
            {content.description}
          </p>
        </div>

        {shouldShowSocialAuth ? (
          <>
            <MotionContainer className="mb-6 flex flex-col gap-3">
              <MotionItem staggered>
                <AuthSocialButton provider="google" label={content.googleLabel} />
              </MotionItem>
              <MotionItem staggered>
                <AuthSocialButton provider="apple" label={content.appleLabel} />
              </MotionItem>
            </MotionContainer>

            <div className="mb-6 flex items-center">
              <div className="flex-1 border-t border-[#262729]" />
              <span className="px-4 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
                {authContent.shared.divider}
              </span>
              <div className="flex-1 border-t border-[#262729]" />
            </div>
          </>
        ) : null}

        <MotionForm className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <MotionItem staggered>
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-[12px] font-medium text-[#D1D5DB]"
              >
                {authContent.forms.register.nameLabel}
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={authContent.forms.register.namePlaceholder}
                className="w-full bg-[#1A1B1E] px-3.5 py-2.5 text-[13px] text-white outline-none transition-colors placeholder:text-[#555555] focus:bg-[#202124]"
              />
            </div>
            </MotionItem>
          ) : null}

          {mode === "register" ? (
            <MotionItem staggered>
            <div>
              <label
                htmlFor="company"
                className="mb-1.5 block text-[12px] font-medium text-[#D1D5DB]"
              >
                Empresa
              </label>

              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="Nome da empresa"
                className="w-full bg-[#1A1B1E] px-3.5 py-2.5 text-[13px] text-white outline-none transition-colors placeholder:text-[#555555] focus:bg-[#202124]"
              />
            </div>
            </MotionItem>
          ) : null}

          <MotionItem staggered>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[12px] font-medium text-[#D1D5DB]"
            >
              {content.emailLabel}
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={content.emailPlaceholder}
              className="w-full bg-[#1A1B1E] px-3.5 py-2.5 text-[13px] text-white outline-none transition-colors placeholder:text-[#555555] focus:bg-[#202124]"
            />
          </div>
          </MotionItem>

          <MotionItem staggered>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[12px] font-medium text-[#D1D5DB]"
            >
              {content.passwordLabel}
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                placeholder={content.passwordPlaceholder}
                className="w-full bg-[#1A1B1E] py-2.5 pl-3.5 pr-10 text-[13px] text-white outline-none transition-colors placeholder:text-[#555555] focus:bg-[#202124]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] transition-colors hover:text-[#D1D5DB]"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            {mode === "login" ? (
              <div className="mb-6 mt-2 flex justify-end">
                <a
                  href="#recuperar-senha"
                  className="text-[11px] text-[#888888] transition-colors hover:text-white"
                >
                  {authContent.forms.login.forgotPasswordLabel}
                </a>
              </div>
            ) : null}
          </div>
          </MotionItem>

          {formError ? (
            <p className="text-[12px] leading-relaxed text-red-300" role="alert">
              {formError}
            </p>
          ) : null}

          <MotionItem staggered>
          <div className="mb-8 flex items-center justify-between gap-6">
            <div>
              <h2 className="mb-0.5 text-[13px] font-medium text-white">
                {authContent.shared.updatesTitle}
              </h2>

              <p className="max-w-[280px] text-[11px] leading-relaxed text-[#666666]">
                {authContent.shared.updatesDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReceiveUpdates(!receiveUpdates)}
              className={`relative inline-flex h-[18px] w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                receiveUpdates ? "bg-white" : "bg-[#262729]"
              }`}
              role="switch"
              aria-checked={receiveUpdates}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-[14px] w-[14px] transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                  receiveUpdates
                    ? "translate-x-3.5 bg-black"
                    : "translate-x-0 bg-[#888888]"
                }`}
              />
            </button>
          </div>
          </MotionItem>

          <MotionItem staggered>
          <MotionButton
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-white py-2.5 text-[14px] font-semibold text-black transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#121214]"
          >
            {submitting ? "Processando..." : content.submitLabel}
          </MotionButton>
          </MotionItem>

          <MotionItem staggered>
          <div className="mt-4 text-center">
            <span className="text-[12px] text-[#888888]">
              {content.switchText}{" "}
              <Link
                href={content.switchHref}
                className="font-medium text-white hover:underline"
              >
                {content.switchLabel}
              </Link>
            </span>
          </div>
          </MotionItem>
        </MotionForm>
      </div>

      <div className="mt-12 text-right md:absolute md:bottom-10 md:right-14">
        <p className="text-[11px] text-[#555555]">
          {authContent.shared.copyright}
        </p>
      </div>
    </section>
  );
}
