import { AuthBrandPanel } from "./AuthBrandPanel";
import { AuthForm } from "./AuthForm";
import { MotionItem } from "../motion";

export type AuthMode = "login" | "register";

type AuthPageProps = {
  mode: AuthMode;
};

export function AuthPage({ mode }: AuthPageProps) {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#121214] text-white antialiased">
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#121214] md:flex-row">
        <MotionItem direction="right" amount={0.05} className="w-full md:w-[45%]">
          <AuthBrandPanel />
        </MotionItem>
        <MotionItem direction="left" amount={0.05} className="w-full md:w-[55%]">
          <AuthForm mode={mode} />
        </MotionItem>
      </section>
    </main>
  );
}
