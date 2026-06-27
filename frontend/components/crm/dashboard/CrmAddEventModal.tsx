"use client";

import { type FormEvent } from "react";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmInput, CrmSelect, CrmTextarea } from "@/components/crm/ui/CrmFields";
import { CrmModal } from "@/components/crm/ui/CrmModal";
import type { CrmEvent, CrmEventCategory } from "@/types/crm";

export function CrmAddEventModal({ onClose, onSave }: { onClose: () => void; onSave?: (event: CrmEvent) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const category = String(form.get("category")) as CrmEventCategory;
    onSave?.({
      id: Date.now(),
      title: String(form.get("title")),
      date: String(form.get("date")),
      time: String(form.get("time")),
      category,
      description: String(form.get("description")),
      colorClass: category === "Entrega" ? "bg-black" : category === "Planejamento" ? "bg-rose-400" : category === "Pessoal" ? "bg-amber-400" : "bg-emerald-400",
    });
    onClose();
  }

  return (
    <CrmModal title="Adicionar evento" onClose={onClose}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <CrmInput name="title" label="Nome do evento" placeholder="Ex: Reuniao mensal" required />
        <div className="grid gap-4 sm:grid-cols-2"><CrmInput name="date" label="Data" type="date" required /><CrmInput name="time" label="Horario" type="time" required /></div>
        <CrmSelect name="category" label="Categoria" defaultValue="Reuniao"><option>Reuniao</option><option>Entrega</option><option>Planejamento</option><option>Pessoal</option></CrmSelect>
        <CrmTextarea name="description" label="Descricao" rows={3} placeholder="Detalhes do evento..." />
        <CrmButton type="submit" className="w-full py-3">Salvar evento</CrmButton>
      </form>
    </CrmModal>
  );
}
