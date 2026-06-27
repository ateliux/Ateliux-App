"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function CrmModal({
  children,
  onClose,
  title,
  description,
  size = "md",
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="crm-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`relative my-6 w-full rounded-2xl bg-white p-6 shadow-2xl sm:p-8 ${sizes[size]}`}>
        <button type="button" onClick={onClose} aria-label="Fechar modal" className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="mb-6 pr-10">
          <h2 id="crm-modal-title" className="text-xl font-bold text-slate-800">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

