"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { crmUsers } from "@/data/crm/crm-mock-data";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";

export function CrmNotificationsPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar notificacoes"
        className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-[1px] focus:outline-none"
      />
      <aside
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm overflow-y-auto border-l border-slate-100 bg-white p-6 shadow-2xl"
        aria-label="Notificacoes"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Notificacoes</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar notificacoes"
            className="rounded-lg bg-slate-50 p-2 text-slate-400 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          {crmUsers.slice(1, 7).map((user, index) => (
            <div key={user.id} className="flex gap-3 rounded-xl bg-slate-100 p-3">
              <CrmAvatar src={user.avatar} alt={`Foto de ${user.name}`} size="sm" />
              <div>
                <p className="text-sm leading-5 text-slate-700">
                  <strong>{user.name}</strong>{" "}
                  {index % 2 ? "atualizou uma tarefa em" : "mencionou voce em"}{" "}
                  <strong className="text-black">Design System</strong>.
                </p>
                <p className="mt-1 text-xs text-slate-400">Ha {index + 1} horas</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>,
    document.body,
  );
}
