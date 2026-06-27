"use client";

import { CrmButton } from "./CrmButton";
import { CrmModal } from "./CrmModal";

export function CrmConfirmDialog({ title, description, confirmLabel = "Confirmar", onConfirm, onClose, danger = false }: { title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void; danger?: boolean }) {
  return (
    <CrmModal title={title} description={description} onClose={onClose} size="sm">
      <div className="flex justify-end gap-3">
        <CrmButton variant="secondary" onClick={onClose}>Cancelar</CrmButton>
        <CrmButton className={danger ? "bg-rose-600 hover:bg-rose-700" : ""} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</CrmButton>
      </div>
    </CrmModal>
  );
}

