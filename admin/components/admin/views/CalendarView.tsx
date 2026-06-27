"use client";

import { Calendar as CalendarIcon, ChevronDown, Filter, Plus, X } from "lucide-react";
import { useState } from "react";
import { CALENDAR_EVENTS_MOCK } from "@/data/admin/admin-mock-data";
import type { CalendarCategory } from "@/types/admin";

type FilterState = Record<string, boolean>;
type CategoryState = Record<Exclude<CalendarCategory, "general">, boolean>;

const agendaFilters = {
  recrutamento: "Recrutamento",
  individual: "Individual",
  onboarding: "Integração",
  treinamento: "Treinamento",
  mentoria: "Mentoria",
  desempenho: "Desempenho",
  eventos: "Eventos",
  politicas: "Políticas",
  licencas: "Licenças"
};

const categoryLabels: Record<Exclude<CalendarCategory, "general">, string> = {
  talent: "Aquisição de talentos",
  development: "Desenvolvimento de colaboradores",
  engagement: "Engajamento organizacional"
};

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarView() {
  const [selectedDay, setSelectedDay] = useState(13);
  const [filters, setFilters] = useState<FilterState>({
    recrutamento: true,
    individual: true,
    onboarding: true,
    treinamento: true,
    mentoria: true,
    desempenho: true,
    eventos: true,
    politicas: true,
    licencas: true
  });

  const [categories, setCategories] = useState<CategoryState>({
    talent: true,
    development: true,
    engagement: true
  });

  const scheduleMetrics = [
    { title: "Total de agendas", value: 12, bg: "bg-[#E6F7F1] text-[#00B074]" },
    { title: "Aquisição de talentos", value: 5, bg: "bg-green-50 text-emerald-600" },
    { title: "Desenvolvimento", value: 4, bg: "bg-orange-50 text-orange-600" },
    { title: "Engajamento", value: 3, bg: "bg-purple-50 text-purple-600" }
  ];

  const renderCalendarCells = () => {
    const totalCells = 35;
    const startDayOffset = 5;
    const daysInMonth = 30;

    return Array.from({ length: totalCells }).map((_, index) => {
      const dayNumber = index - startDayOffset + 1;
      const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
      const events = isCurrentMonth ? CALENDAR_EVENTS_MOCK[dayNumber] || [] : [];

      return (
        <button
          type="button"
          key={index}
          onClick={() => isCurrentMonth && setSelectedDay(dayNumber)}
          className={`flex min-h-[100px] cursor-pointer flex-col justify-between border border-gray-100 p-2 text-left transition-all ${
            isCurrentMonth ? "bg-white hover:bg-gray-50/50" : "bg-gray-50/30"
          } ${selectedDay === dayNumber && isCurrentMonth ? "bg-[#E6F7F1]/10 ring-2 ring-[#00B074]/30" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${isCurrentMonth ? "text-gray-700" : "text-gray-300"} ${
                selectedDay === dayNumber && isCurrentMonth ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#00B074] text-white" : ""
              }`}
            >
              {isCurrentMonth ? dayNumber : dayNumber <= 0 ? 31 + dayNumber : dayNumber - daysInMonth}
            </span>
          </div>

          <div className="mt-1 space-y-1 overflow-hidden">
            {events.map((event, eventIndex) => {
              if (event.category === "talent" && !categories.talent) return null;
              if (event.category === "development" && !categories.development) return null;
              if (event.category === "engagement" && !categories.engagement) return null;

              let colorStyles = "border-gray-200 bg-gray-100 text-gray-700";
              if (event.category === "talent") colorStyles = "border-[#A7F3D0] bg-[#E6F7F1] text-[#00B074]";
              if (event.category === "development") colorStyles = "border-orange-200 bg-orange-50 text-orange-600";
              if (event.category === "general") colorStyles = "border-slate-200 bg-slate-100 text-slate-700";

              return (
                <div key={`${event.title}-${eventIndex}`} className={`truncate rounded border p-1 text-[9px] font-medium leading-tight ${colorStyles}`} title={event.title}>
                  {event.title}
                </div>
              );
            })}
          </div>
        </button>
      );
    });
  };

  const selectedDayEvents = CALENDAR_EVENTS_MOCK[selectedDay] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {scheduleMetrics.map((metric) => (
          <div key={metric.title} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{metric.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{metric.value}</h3>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${metric.bg}`}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-800">Filtro</h3>
            <button type="button" className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setFilters(Object.fromEntries(Object.keys(filters).map((key) => [key, false])))}>
              Limpar tudo
            </button>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-700">Agenda</h4>
            <div className="space-y-3">
              {Object.entries(agendaFilters).map(([key, label]) => (
                <label key={key} className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={() => setFilters((previous) => ({ ...previous, [key]: !previous[key] }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#00B074] focus:ring-[#00B074]"
                  />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-700">Categoria</h4>
            <div className="space-y-3">
              {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((key) => (
                <label key={key} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={categories[key]}
                    onChange={() => setCategories((previous) => ({ ...previous, [key]: !previous[key] }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#00B074] focus:ring-[#00B074]"
                  />
                  <span className={`text-xs font-semibold ${key === "talent" ? "text-emerald-600" : key === "development" ? "text-orange-600" : "text-purple-600"}`}>
                    {categoryLabels[key]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">Junho 2035</h3>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button type="button" className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100">
                <Filter className="h-3.5 w-3.5" /> Filtrar
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100">
                <CalendarIcon className="h-3.5 w-3.5" /> Mês
              </button>
              <button type="button" className="ml-auto flex items-center gap-1 rounded-xl bg-[#00B074] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#009662] sm:ml-0">
                <Plus className="h-3.5 w-3.5" /> Nova Agenda
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-px text-center">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2 text-xs font-bold uppercase tracking-wide text-gray-400">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-inner">
            {renderCalendarCells()}
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Detalhes da Agenda</h3>
              <p className="mt-0.5 text-[10px] text-gray-400">{selectedDay} junho 2035</p>
            </div>
            <button type="button" className="rounded-lg bg-gray-50 p-1.5 text-gray-400 transition-colors hover:bg-gray-100" aria-label="Fechar detalhes">
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedDayEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDayEvents.map((event, index) => {
                let cardBg = "border-slate-100 bg-slate-50";
                let tagText = "Geral";
                let tagColor = "bg-slate-100 text-slate-500";

                if (event.category === "talent") {
                  cardBg = "border-[#A7F3D0]/40 bg-[#E6F7F1]/50";
                  tagText = "Aquisição de talentos";
                  tagColor = "bg-[#E6F7F1] text-[#00B074]";
                } else if (event.category === "development") {
                  cardBg = "border-orange-100 bg-orange-50/50";
                  tagText = "Desenvolvimento";
                  tagColor = "bg-orange-50 text-orange-600";
                }

                return (
                  <div key={`${event.title}-${index}`} className={`space-y-3 rounded-2xl border p-4 ${cardBg}`}>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${tagColor}`}>{tagText}</span>
                    <h4 className="text-sm font-bold leading-snug text-gray-800">{event.title}</h4>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      {event.time ? <p><strong className="text-gray-700">Hora:</strong> {event.time}</p> : null}
                      {event.location ? <p><strong className="text-gray-700">Local:</strong> {event.location}</p> : null}
                      {event.note ? <p><strong className="text-gray-700">Nota:</strong> {event.note}</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="mb-3 h-12 w-12 text-gray-200" />
              <p className="text-xs font-semibold text-gray-400">Sem eventos agendados</p>
              <p className="mt-1 text-[10px] text-gray-300">Selecione outro dia na grade.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
