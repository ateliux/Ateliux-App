"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { crmEvents } from "@/data/crm/crm-mock-data";
import type { CrmEvent, CrmEventCategory } from "@/types/crm";
import { CrmBadge } from "@/components/crm/ui/CrmBadge";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmCard } from "@/components/crm/ui/CrmCard";
import { CrmConfirmDialog } from "@/components/crm/ui/CrmConfirmDialog";
import { CrmInput, CrmSelect, CrmTextarea } from "@/components/crm/ui/CrmFields";
import { CrmModal } from "@/components/crm/ui/CrmModal";
import { CrmPageHeader } from "@/components/crm/ui/CrmPageHeader";
import { CrmToast } from "@/components/crm/ui/CrmToast";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const categoryClasses: Record<CrmEventCategory, string> = {
  Reuniao: "bg-emerald-400",
  Entrega: "bg-black",
  Planejamento: "bg-rose-400",
  Pessoal: "bg-amber-400",
};

const isoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sameMonth = (left: Date, right: Date) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

export function CrmCalendarView() {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CrmEvent[]>(crmEvents);
  const [formEvent, setFormEvent] = useState<CrmEvent | "new" | null>(null);
  const [detailEvent, setDetailEvent] = useState<CrmEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<CrmEvent | null>(null);
  const [toast, setToast] = useState("");

  const days = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const category = String(form.get("category")) as CrmEventCategory;
    const next: CrmEvent = {
      id: typeof formEvent === "object" && formEvent ? formEvent.id : Date.now(),
      title: String(form.get("title")),
      date: String(form.get("date")),
      time: String(form.get("time")),
      category,
      description: String(form.get("description")),
      colorClass: categoryClasses[category],
    };
    setEvents((current) => typeof formEvent === "object" && formEvent ? current.map((item) => item.id === formEvent.id ? next : item) : [...current, next]);
    setFormEvent(null);
    setDetailEvent(null);
    notify(typeof formEvent === "object" ? "Evento atualizado." : "Evento adicionado ao calendario.");
  }

  function removeEvent() {
    if (!deleteEvent) return;
    setEvents((current) => current.filter((item) => item.id !== deleteEvent.id));
    setDetailEvent(null);
    setDeleteEvent(null);
    notify("Evento excluido.");
  }

  const monthTitle = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(visibleMonth);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <CrmPageHeader title="Calendario" actions={<CrmButton onClick={() => setFormEvent("new")}><Plus className="h-4 w-4" aria-hidden="true" />Adicionar evento</CrmButton>} />
      <CrmCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="Mes anterior" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="Proximo mes" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <p className="font-bold capitalize text-slate-800">{monthTitle}</p>
          <button type="button" onClick={() => setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black">Hoje</button>
        </div>
        <div className="overflow-x-auto p-4 sm:p-6">
          <div className="min-w-[760px]">
            <div className="mb-3 grid grid-cols-7 gap-3 text-center">{weekDays.map((day) => <div key={day} className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-3">
              {days.map((date) => {
                const dateIso = isoDate(date);
                const currentMonth = sameMonth(date, visibleMonth);
                const isToday = dateIso === isoDate(today);
                const dateEvents = events.filter((item) => item.date === dateIso);
                return (
                  <div key={dateIso} className={`min-h-28 rounded-xl border p-2.5 transition-colors ${currentMonth ? "border-slate-100 bg-white hover:border-gray-400" : "border-transparent bg-slate-50/70"}`}>
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-medium ${isToday ? "bg-black text-white" : currentMonth ? "text-slate-600" : "text-slate-300"}`}>{date.getDate()}</span>
                    <div className="mt-2 space-y-1.5">
                      {dateEvents.slice(0, 3).map((item) => <button key={item.id} type="button" onClick={() => setDetailEvent(item)} className="block w-full truncate rounded-md border border-gray-200 bg-slate-100 px-2 py-1.5 text-left text-[10px] font-medium text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${item.colorClass}`} />{item.time} {item.title}</button>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CrmCard>

      {formEvent ? (
        <CrmModal title={formEvent === "new" ? "Adicionar evento" : "Editar evento"} onClose={() => setFormEvent(null)} size="lg">
          <form onSubmit={saveEvent} className="grid gap-5 sm:grid-cols-2">
            <CrmInput name="title" label="Titulo do evento" defaultValue={formEvent === "new" ? "" : formEvent.title} required className="sm:col-span-2" />
            <CrmInput name="date" label="Data" type="date" defaultValue={formEvent === "new" ? isoDate(today) : formEvent.date} required />
            <CrmInput name="time" label="Horario" type="time" defaultValue={formEvent === "new" ? "09:00" : formEvent.time} required />
            <CrmSelect name="category" label="Categoria" defaultValue={formEvent === "new" ? "Reuniao" : formEvent.category}>{Object.keys(categoryClasses).map((category) => <option key={category}>{category}</option>)}</CrmSelect>
            <CrmTextarea name="description" label="Descricao" rows={3} defaultValue={formEvent === "new" ? "" : formEvent.description} />
            <div className="flex justify-end gap-3 sm:col-span-2"><CrmButton variant="secondary" onClick={() => setFormEvent(null)}>Cancelar</CrmButton><CrmButton type="submit">Salvar evento</CrmButton></div>
          </form>
        </CrmModal>
      ) : null}

      {detailEvent ? (
        <CrmModal title={detailEvent.title} description={`${detailEvent.date} as ${detailEvent.time}`} onClose={() => setDetailEvent(null)}>
          <div className="space-y-5 text-sm text-slate-600"><CrmBadge variant="gray">{detailEvent.category}</CrmBadge><p className="leading-6">{detailEvent.description}</p><div className="flex justify-end gap-3"><CrmButton variant="secondary" onClick={() => setDeleteEvent(detailEvent)}>Excluir</CrmButton><CrmButton onClick={() => { setFormEvent(detailEvent); setDetailEvent(null); }}>Editar</CrmButton></div></div>
        </CrmModal>
      ) : null}
      {deleteEvent ? <CrmConfirmDialog title="Excluir evento?" description={`O evento "${deleteEvent.title}" sera removido desta visualizacao mockada.`} confirmLabel="Excluir evento" danger onConfirm={removeEvent} onClose={() => setDeleteEvent(null)} /> : null}
      {toast ? <CrmToast message={toast} /> : null}
    </div>
  );
}
