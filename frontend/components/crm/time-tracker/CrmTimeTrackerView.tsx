"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Clock3, MoreHorizontal, Pause, Play, Plus, Square } from "lucide-react";
import { crmProjects, crmTasks, crmUsers } from "@/data/crm/crm-mock-data";
import type { CrmTask, CrmTaskPriority } from "@/types/crm";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";
import { CrmBadge } from "@/components/crm/ui/CrmBadge";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmCard } from "@/components/crm/ui/CrmCard";
import { CrmConfirmDialog } from "@/components/crm/ui/CrmConfirmDialog";
import { CrmDropdownMenu } from "@/components/crm/ui/CrmDropdownMenu";
import { CrmInput, CrmSelect, CrmTextarea } from "@/components/crm/ui/CrmFields";
import { CrmModal } from "@/components/crm/ui/CrmModal";
import { CrmPageHeader } from "@/components/crm/ui/CrmPageHeader";
import { CrmToast } from "@/components/crm/ui/CrmToast";

type TaskModal = { mode: "details" | "edit"; task: CrmTask } | { mode: "create"; task?: never };

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((value) => String(value).padStart(2, "0")).join(":");
};

export function CrmTimeTrackerView() {
  const [tasks, setTasks] = useState<CrmTask[]>(crmTasks);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [modal, setModal] = useState<TaskModal | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CrmTask | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (activeTaskId === null) return;
    const timer = window.setInterval(() => {
      setTasks((current) => current.map((task) => task.id === activeTaskId ? { ...task, elapsedSeconds: task.elapsedSeconds + 1, status: "Em andamento" } : task));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeTaskId]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: CrmTask = {
      id: modal?.mode === "edit" ? modal.task.id : Date.now(),
      title: String(form.get("title")),
      projectId: Number(form.get("projectId")),
      description: String(form.get("description")),
      priority: String(form.get("priority")) as CrmTaskPriority,
      estimatedHours: Number(form.get("estimatedHours")),
      assigneeId: Number(form.get("assigneeId")),
      status: modal?.mode === "edit" ? modal.task.status : "Pendente",
      elapsedSeconds: modal?.mode === "edit" ? modal.task.elapsedSeconds : 0,
    };
    setTasks((current) => modal?.mode === "edit" ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    setModal(null);
    notify(modal?.mode === "edit" ? "Tarefa atualizada." : "Tarefa adicionada.");
  }

  function toggleTimer(task: CrmTask) {
    if (task.status === "Concluida") return;
    setActiveTaskId((current) => current === task.id ? null : task.id);
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "Em andamento" } : item));
    notify(activeTaskId === task.id ? "Cronometro pausado." : activeTaskId ? "Tarefa anterior pausada. Novo cronometro iniciado." : "Cronometro iniciado.");
  }

  function completeTask(task: CrmTask) {
    if (activeTaskId === task.id) setActiveTaskId(null);
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "Concluida" } : item));
    notify("Tarefa finalizada.");
  }

  const totalSeconds = tasks.reduce((sum, task) => sum + task.elapsedSeconds, 0);
  const activeCount = tasks.filter((task) => task.status === "Em andamento").length;
  const completedCount = tasks.filter((task) => task.status === "Concluida").length;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <CrmPageHeader title="Rastreador de tempo - pessoal" description="Registre e acompanhe o tempo dedicado aos projetos." actions={tasks.length ? <CrmButton onClick={() => setModal({ mode: "create" })}><Plus className="h-4 w-4" aria-hidden="true" />Adicionar tarefa</CrmButton> : undefined} />

      {tasks.length ? <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Tarefas totais", tasks.length], ["Em andamento", activeCount], ["Concluidas", completedCount], ["Tempo registrado", formatTime(totalSeconds)]].map(([label, value]) => <CrmCard key={label} className="p-4"><p className="text-xs uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-xl font-bold text-slate-800">{value}</p></CrmCard>)}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CrmCard className="p-5">
          <span className={`grid h-12 w-12 place-items-center rounded-xl font-bold ${crmProjects[0].colorClass}`}>{crmProjects[0].icon}</span>
          <h2 className="mt-4 font-bold text-slate-800">{crmProjects[0].name}</h2><p className="mt-1 text-xs text-slate-500">{crmProjects[0].company}</p>
          <div className="my-5 h-px bg-slate-100" /><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Equipe do projeto</p>
          <div className="mt-3 flex -space-x-2">{crmUsers.slice(0, 4).map((user) => <CrmAvatar key={user.id} src={user.avatar} alt={`Foto de ${user.name}`} size="sm" className="border-2 border-white" />)}</div>
          <div className="mt-6 space-y-3 text-xs text-slate-500"><div className="flex justify-between"><span>Tempo registrado</span><strong className="text-slate-700">{formatTime(totalSeconds)}</strong></div><div className="flex justify-between"><span>Tarefas concluidas</span><strong className="text-slate-700">{completedCount}</strong></div></div>
        </CrmCard>

        {tasks.length === 0 ? (
          <CrmCard className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center">
            <span className="relative grid h-44 w-44 place-items-center rounded-full bg-slate-100 text-slate-300"><span className="absolute h-28 w-28 rounded-full border-2 border-dashed border-slate-300" /><Clock3 className="h-20 w-20" aria-hidden="true" /></span>
            <h2 className="mt-7 text-xl font-bold text-slate-800">Ainda nao ha tarefas neste projeto</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Adicione uma tarefa para comecar a registrar seu tempo e acompanhar a produtividade.</p>
            <CrmButton className="mt-6" onClick={() => setModal({ mode: "create" })}><Plus className="h-5 w-5" aria-hidden="true" />Adicionar tarefa</CrmButton>
          </CrmCard>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const project = crmProjects.find((item) => item.id === task.projectId) ?? crmProjects[0];
              const running = activeTaskId === task.id;
              return (
                <CrmCard key={task.id} className="p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => setModal({ mode: "details", task })} className="min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><span className="block truncate font-bold text-slate-800">{task.title}</span><span className="mt-1 block text-xs text-slate-500">{project.name} · prioridade {task.priority.toLowerCase()}</span></button>
                    <div className="flex flex-wrap items-center gap-3"><CrmBadge variant={task.status === "Concluida" ? "green" : task.status === "Em andamento" ? "yellow" : "gray"}>{task.status}</CrmBadge><span className="min-w-24 font-mono text-sm font-bold text-slate-800">{formatTime(task.elapsedSeconds)}</span>
                      <button type="button" disabled={task.status === "Concluida"} onClick={() => toggleTimer(task)} aria-label={running ? `Pausar ${task.title}` : `Iniciar ${task.title}`} className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white disabled:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">{running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}</button>
                      <button type="button" disabled={task.status === "Concluida"} onClick={() => completeTask(task)} aria-label={`Finalizar ${task.title}`} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><Square className="h-4 w-4" aria-hidden="true" /></button>
                      <div className="relative"><button type="button" onClick={() => setOpenMenu((current) => current === task.id ? null : task.id)} aria-label={`Abrir opcoes de ${task.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><MoreHorizontal className="h-5 w-5" aria-hidden="true" /></button>
                        {openMenu === task.id ? <CrmDropdownMenu onClose={() => setOpenMenu(null)} items={[
                          { label: "Ver detalhes", onSelect: () => setModal({ mode: "details", task }) },
                          { label: "Editar tarefa", onSelect: () => setModal({ mode: "edit", task }) },
                          { label: "Duplicar tarefa", onSelect: () => { setTasks((current) => [...current, { ...task, id: Date.now(), title: `${task.title} - copia`, elapsedSeconds: 0, status: "Pendente" }]); notify("Tarefa duplicada."); } },
                          { label: "Excluir tarefa", danger: true, onSelect: () => setConfirmDelete(task) },
                        ]} /> : null}
                      </div>
                    </div>
                  </div>
                </CrmCard>
              );
            })}
          </div>
        )}
      </div>

      {modal?.mode === "create" || modal?.mode === "edit" ? (
        <CrmModal title={modal.mode === "create" ? "Adicionar tarefa" : "Editar tarefa"} onClose={() => setModal(null)} size="lg">
          <form onSubmit={saveTask} className="grid gap-5 sm:grid-cols-2">
            <CrmInput name="title" label="Titulo" defaultValue={modal.mode === "edit" ? modal.task.title : ""} required />
            <CrmSelect name="projectId" label="Projeto" defaultValue={modal.mode === "edit" ? modal.task.projectId : crmProjects[0].id}>{crmProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</CrmSelect>
            <CrmSelect name="priority" label="Prioridade" defaultValue={modal.mode === "edit" ? modal.task.priority : "Media"}><option>Baixa</option><option>Media</option><option>Alta</option></CrmSelect>
            <CrmInput name="estimatedHours" label="Estimativa de horas" type="number" min="0" defaultValue={modal.mode === "edit" ? modal.task.estimatedHours : 1} />
            <CrmSelect name="assigneeId" label="Responsavel" defaultValue={modal.mode === "edit" ? modal.task.assigneeId : crmUsers[0].id}>{crmUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</CrmSelect>
            <CrmTextarea name="description" label="Descricao" rows={3} defaultValue={modal.mode === "edit" ? modal.task.description : ""} />
            <div className="flex justify-end gap-3 sm:col-span-2"><CrmButton variant="secondary" onClick={() => setModal(null)}>Cancelar</CrmButton><CrmButton type="submit">Salvar tarefa</CrmButton></div>
          </form>
        </CrmModal>
      ) : null}
      {modal?.mode === "details" ? <CrmModal title={modal.task.title} description={modal.task.description} onClose={() => setModal(null)}><div className="space-y-3 text-sm text-slate-600"><p>Tempo registrado: <strong>{formatTime(modal.task.elapsedSeconds)}</strong></p><p>Estimativa: <strong>{modal.task.estimatedHours}h</strong></p><p>Prioridade: <strong>{modal.task.priority}</strong></p><div className="flex justify-end"><CrmButton onClick={() => setModal({ mode: "edit", task: modal.task })}>Editar tarefa</CrmButton></div></div></CrmModal> : null}
      {confirmDelete ? <CrmConfirmDialog title="Excluir tarefa?" description={`"${confirmDelete.title}" sera removida e seu tempo local sera perdido.`} confirmLabel="Excluir tarefa" danger onConfirm={() => { if (activeTaskId === confirmDelete.id) setActiveTaskId(null); setTasks((current) => current.filter((item) => item.id !== confirmDelete.id)); notify("Tarefa excluida."); }} onClose={() => setConfirmDelete(null)} /> : null}
      {toast ? <CrmToast message={toast} /> : null}
    </div>
  );
}
