import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { headerContent } from "@/content/home";
import { Logo } from "@/components/ui/Logo";

export function CrmOnboardingLayout({ children, step }: { children: ReactNode; step: 2 | 3 }) {
  return (
    <div className="min-h-screen bg-white text-slate-800 lg:grid lg:grid-cols-[360px_1fr]">
      <aside className="relative overflow-hidden bg-black p-7 text-white sm:p-10 lg:min-h-screen lg:p-12">
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full border-[50px] border-white/10" />
        <div className="relative">
          <span className="inline-flex rounded-xl bg-white px-4 py-3">
            <Logo src={headerContent.logo.src} alt={headerContent.logo.alt} priority className="h-7 w-auto max-w-[150px]" />
          </span>
          <h1 className="mt-10 text-3xl font-bold lg:mt-20">Comecar</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-gray-300">Configure seu espaco de trabalho em poucos passos.</p>
          <ol className="mt-9 space-y-6">
            {[
              { number: 1, label: "Criar conta", done: true },
              { number: 2, label: "Validar telefone", done: step > 2 },
              { number: 3, label: "Sobre sua empresa", done: false },
            ].map((item) => {
              const active = item.number === step;
              return (
                <li key={item.number} className={`flex items-center gap-4 text-sm ${active ? "font-semibold text-white" : "text-gray-300"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-bold ${item.done ? "border-white bg-white text-black" : active ? "border-white text-white" : "border-white/40 text-white/60"}`}>
                    {item.done ? <Check className="h-4 w-4" aria-hidden="true" /> : item.number}
                  </span>
                  {item.label}
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
      <main className="grid min-h-[65vh] place-items-center p-6 sm:p-10 lg:min-h-screen">{children}</main>
    </div>
  );
}
