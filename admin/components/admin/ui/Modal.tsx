"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  description?: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClassName = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
} as const;

export function Modal({ title, description, children, isOpen, onClose, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full overflow-hidden rounded-3xl bg-white shadow-2xl ${sizeClassName[size]}`}>
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-gray-50 p-2 text-gray-400 transition-colors hover:text-gray-700" aria-label="Fechar modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
