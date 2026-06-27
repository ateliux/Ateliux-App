"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, MoreHorizontal, Plus } from "lucide-react";
import {
  crmActivities,
  crmEvents,
  crmProjects,
  crmUsers,
  crmWorkload,
} from "@/data/crm/crm-mock-data";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";
import { CrmBadge } from "@/components/crm/ui/CrmBadge";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmCard } from "@/components/crm/ui/CrmCard";
import { CrmPageHeader } from "@/components/crm/ui/CrmPageHeader";
import { CrmToast } from "@/components/crm/ui/CrmToast";
import { CrmAddEventModal } from "./CrmAddEventModal";

export function CrmDashboardView() {
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [events, setEvents] = useState(crmEvents);
  const [toast, setToast] = useState("");

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <CrmPageHeader
        title="Painel"
        description="Bem-vindo de volta, Evan!"
        actions={
          <>
            <Link href="/crm/calendario" className="hidden items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:inline-flex">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Abrir calendario
            </Link>
            <CrmButton onClick={() => setEventModalOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar evento
            </CrmButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <CrmCard className="p-5 sm:p-6">
            <h2 className="mb-6 font-bold text-slate-800">Carga de trabalho</h2>
            <div className="grid gap-8 sm:grid-cols-[180px_1fr] sm:items-center">
              <div className="text-center">
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-[7px] border-black border-r-gray-200">
                  <span className="text-3xl font-bold text-slate-800">12</span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">Projetos ativos</p>
              </div>
              <div className="space-y-5">
                {crmWorkload.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-slate-700">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full ${item.colorClass}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CrmCard>

          <CrmCard className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Projetos recentes</h2>
              <Link href="/crm/projetos" className="text-sm font-semibold text-black hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                Ver todos
              </Link>
            </div>
            <div className="space-y-3">
              {crmProjects.slice(0, 2).map((project) => (
                <div key={project.id} className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg font-bold ${project.colorClass}`}>{project.icon}</span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-800">{project.name}</h3>
                      <p className="truncate text-xs text-slate-500">{project.company}</p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <CrmBadge variant={project.status === "Concluido" ? "green" : "blue"}>{project.status}</CrmBadge>
                    <p className="mt-1 text-xs text-slate-400">{project.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CrmCard>
        </div>

        <div className="space-y-6">
          <CrmCard className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Eventos proximos</h2>
              <Link href="/crm/calendario" aria-label="Ver calendario" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
            <div className="space-y-5">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex gap-3">
                  <span className={`w-1 shrink-0 rounded-full ${event.colorClass}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(`${event.date}T00:00:00`).toLocaleDateString("pt-BR")}, {event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CrmCard>

          <CrmCard className="p-5 sm:p-6">
            <h2 className="mb-5 font-bold text-slate-800">Atividade recente</h2>
            <div className="space-y-4">
              {crmActivities.map((activity) => {
                const user = crmUsers.find((item) => item.id === activity.userId) ?? crmUsers[0];

                return (
                  <div key={activity.id} className="flex gap-3">
                    <CrmAvatar src={user.avatar} alt={`Foto de ${user.name}`} size="sm" />
                    <div>
                      <p className="text-xs leading-5 text-slate-600"><strong className="text-slate-800">{user.name}</strong> {activity.message}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CrmCard>
        </div>
      </div>

      {eventModalOpen ? <CrmAddEventModal onClose={() => setEventModalOpen(false)} onSave={(event) => { setEvents((current) => [event, ...current]); setToast("Evento adicionado ao dashboard."); window.setTimeout(() => setToast(""), 2800); }} /> : null}
      {toast ? <CrmToast message={toast} /> : null}
    </div>
  );
}
