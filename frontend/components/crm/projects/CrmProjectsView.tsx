"use client";

import { useState, type FormEvent } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { crmProjects, crmUsers } from "@/data/crm/crm-mock-data";
import type { CrmProject, CrmProjectStatus } from "@/types/crm";
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

type ProjectModal = { mode: "details" | "edit"; project: CrmProject } | { mode: "create"; project?: never };

const badgeVariant = (status: CrmProjectStatus) => status === "Concluido" ? "green" : status === "Em revisao" ? "yellow" : status === "Arquivado" ? "gray" : "blue";

export function CrmProjectsView() {
  const [projects, setProjects] = useState<CrmProject[]>(crmProjects);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [modal, setModal] = useState<ProjectModal | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CrmProject | null>(null);
  const [toast, setToast] = useState("");

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const next: CrmProject = {
      id: modal?.mode === "edit" ? modal.project.id : Date.now(),
      name,
      company: String(form.get("company")),
      date: String(form.get("date")),
      budget: Number(form.get("budget")),
      status: String(form.get("status")) as CrmProjectStatus,
      icon: name.slice(0, 1).toUpperCase() || "P",
      colorClass: "bg-slate-100 text-black",
      progress: Number(form.get("progress")),
      description: String(form.get("description")),
      nextTasks: modal?.mode === "edit" ? modal.project.nextTasks : ["Definir proximos passos"],
      teamIds: modal?.mode === "edit" ? modal.project.teamIds : [1, 2],
    };
    setProjects((current) => modal?.mode === "edit" ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    notify(modal?.mode === "edit" ? "Projeto atualizado." : "Projeto adicionado.");
    setModal(null);
  }

  function duplicateProject(project: CrmProject) {
    setProjects((current) => [...current, { ...project, id: Date.now(), name: `${project.name} - copia`, status: "Em andamento", progress: 0, archived: false }]);
    notify("Projeto duplicado.");
  }

  function toggleComplete(project: CrmProject) {
    const completed = project.status !== "Concluido";
    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, status: completed ? "Concluido" : "Em andamento", progress: completed ? 100 : Math.min(item.progress, 90) } : item));
    notify(completed ? "Projeto marcado como concluido." : "Projeto reaberto.");
  }

  function archiveProject(project: CrmProject) {
    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, archived: true, status: "Arquivado" } : item));
    notify("Projeto arquivado e removido da lista principal.");
  }

  const visibleProjects = projects.filter((project) => !project.archived);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <CrmPageHeader title="Projetos" description={`${visibleProjects.length} ativos · ${projects.length - visibleProjects.length} arquivados`} actions={<CrmButton onClick={() => setModal({ mode: "create" })}><Plus className="h-4 w-4" aria-hidden="true" />Adicionar projeto</CrmButton>} />
      <div className="grid gap-5">
        {visibleProjects.map((project) => (
          <CrmCard key={project.id} className="grid gap-5 p-5 md:grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_auto_auto] md:items-center">
            <button type="button" onClick={() => setModal({ mode: "details", project })} className="flex min-w-0 items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-bold ${project.colorClass}`}>{project.icon}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800">{project.name}</span><span className="mt-1 block text-xs text-slate-500">{project.company} · {project.date}</span></span>
            </button>
            <div><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Progresso</span><strong className="text-slate-700">{project.progress}%</strong></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-black" style={{ width: `${project.progress}%` }} /></div></div>
            <div><p className="text-sm font-bold text-slate-800">${project.budget}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Orcamento</p></div>
            <div className="flex items-center justify-between gap-4 md:justify-end">
              <div className="flex -space-x-2">{project.teamIds.slice(0, 3).map((id) => { const user = crmUsers.find((item) => item.id === id) ?? crmUsers[0]; return <CrmAvatar key={id} src={user.avatar} alt={`Foto de ${user.name}`} size="sm" className="border-2 border-white" />; })}</div>
              <CrmBadge variant={badgeVariant(project.status)}>{project.status}</CrmBadge>
              <div className="relative">
                <button type="button" onClick={() => setOpenMenu((current) => current === project.id ? null : project.id)} aria-label={`Abrir opcoes de ${project.name}`} aria-expanded={openMenu === project.id} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><MoreHorizontal className="h-5 w-5" aria-hidden="true" /></button>
                {openMenu === project.id ? <CrmDropdownMenu onClose={() => setOpenMenu(null)} items={[
                  { label: "Ver detalhes", onSelect: () => setModal({ mode: "details", project }) },
                  { label: "Editar projeto", onSelect: () => setModal({ mode: "edit", project }) },
                  { label: "Duplicar projeto", onSelect: () => duplicateProject(project) },
                  { label: project.status === "Concluido" ? "Reabrir projeto" : "Marcar como concluido", onSelect: () => toggleComplete(project) },
                  { label: "Arquivar projeto", onSelect: () => archiveProject(project) },
                  { label: "Excluir projeto", danger: true, onSelect: () => setConfirmDelete(project) },
                ]} /> : null}
              </div>
            </div>
          </CrmCard>
        ))}
      </div>

      {modal?.mode === "details" ? (
        <CrmModal title={modal.project.name} description={modal.project.description} onClose={() => setModal(null)} size="lg">
          <div className="grid gap-5 text-sm sm:grid-cols-2">
            <div><p className="text-xs uppercase tracking-wider text-slate-400">Cliente</p><p className="mt-1 font-semibold text-slate-800">{modal.project.company}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-slate-400">Data</p><p className="mt-1 font-semibold text-slate-800">{modal.project.date}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-slate-400">Orcamento</p><p className="mt-1 font-semibold text-slate-800">${modal.project.budget}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-slate-400">Status e progresso</p><p className="mt-1 font-semibold text-slate-800">{modal.project.status} · {modal.project.progress}%</p></div>
            <div className="sm:col-span-2"><p className="text-xs uppercase tracking-wider text-slate-400">Equipe</p><div className="mt-2 flex gap-2">{modal.project.teamIds.map((id) => { const user = crmUsers.find((item) => item.id === id) ?? crmUsers[0]; return <CrmAvatar key={id} src={user.avatar} alt={`Foto de ${user.name}`} size="sm" />; })}</div></div>
            <div className="sm:col-span-2"><p className="text-xs uppercase tracking-wider text-slate-400">Proximas tarefas</p><ul className="mt-2 space-y-2 text-slate-600">{modal.project.nextTasks.map((task) => <li key={task}>• {task}</li>)}</ul></div>
            <div className="flex justify-end sm:col-span-2"><CrmButton onClick={() => setModal({ mode: "edit", project: modal.project })}>Editar projeto</CrmButton></div>
          </div>
        </CrmModal>
      ) : null}

      {modal?.mode === "create" || modal?.mode === "edit" ? (
        <CrmModal title={modal.mode === "create" ? "Adicionar projeto" : "Editar projeto"} onClose={() => setModal(null)} size="lg">
          <form onSubmit={saveProject} className="grid gap-5 sm:grid-cols-2">
            <CrmInput name="name" label="Nome do projeto" defaultValue={modal.mode === "edit" ? modal.project.name : ""} required />
            <CrmInput name="company" label="Cliente" defaultValue={modal.mode === "edit" ? modal.project.company : ""} required />
            <CrmInput name="budget" label="Orcamento" type="number" min="0" defaultValue={modal.mode === "edit" ? modal.project.budget : 0} required />
            <CrmInput name="date" label="Data" defaultValue={modal.mode === "edit" ? modal.project.date : new Date().toLocaleDateString("pt-BR")} required />
            <CrmSelect name="status" label="Status inicial" defaultValue={modal.mode === "edit" ? modal.project.status : "Em andamento"}><option>Em andamento</option><option>Em revisao</option><option>Concluido</option></CrmSelect>
            <CrmInput name="progress" label="Progresso (%)" type="number" min="0" max="100" defaultValue={modal.mode === "edit" ? modal.project.progress : 0} />
            <CrmTextarea name="description" label="Descricao" rows={3} defaultValue={modal.mode === "edit" ? modal.project.description : ""} />
            <div className="flex justify-end gap-3 sm:col-span-2"><CrmButton variant="secondary" onClick={() => setModal(null)}>Cancelar</CrmButton><CrmButton type="submit">Salvar projeto</CrmButton></div>
          </form>
        </CrmModal>
      ) : null}

      {confirmDelete ? <CrmConfirmDialog title="Excluir projeto?" description={`"${confirmDelete.name}" sera removido desta lista mockada.`} confirmLabel="Excluir projeto" danger onConfirm={() => { setProjects((current) => current.filter((item) => item.id !== confirmDelete.id)); notify("Projeto excluido."); }} onClose={() => setConfirmDelete(null)} /> : null}
      {toast ? <CrmToast message={toast} /> : null}
    </div>
  );
}
