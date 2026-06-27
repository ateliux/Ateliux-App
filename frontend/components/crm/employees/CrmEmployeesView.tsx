"use client";

import { useState, type FormEvent } from "react";
import { Filter, Grid2X2, List, MoreHorizontal, MoreVertical, Plus } from "lucide-react";
import { crmProjects, crmUsers } from "@/data/crm/crm-mock-data";
import type { CrmEmployee, CrmEmployeeStatus, CrmEmployeeViewMode } from "@/types/crm";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";
import { CrmBadge } from "@/components/crm/ui/CrmBadge";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmCard } from "@/components/crm/ui/CrmCard";
import { CrmConfirmDialog } from "@/components/crm/ui/CrmConfirmDialog";
import { CrmDropdownMenu } from "@/components/crm/ui/CrmDropdownMenu";
import { CrmInput, CrmSelect } from "@/components/crm/ui/CrmFields";
import { CrmModal } from "@/components/crm/ui/CrmModal";
import { CrmPageHeader } from "@/components/crm/ui/CrmPageHeader";
import { CrmToast } from "@/components/crm/ui/CrmToast";

type EmployeeModal = { mode: "details" | "edit" | "projects"; employee: CrmEmployee } | { mode: "create"; employee?: never };
const fallbackAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop";

export function CrmEmployeesView() {
  const [view, setView] = useState<CrmEmployeeViewMode>("grid");
  const [employees, setEmployees] = useState<CrmEmployee[]>(crmUsers);
  const [activeOnly, setActiveOnly] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [modal, setModal] = useState<EmployeeModal | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<CrmEmployee | null>(null);
  const [toast, setToast] = useState("");

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: CrmEmployee = {
      ...(modal?.mode === "edit" ? modal.employee : {
        id: Date.now(), age: 30, projects: 0, tasks: 0, absences: 0, location: "Nao informado", companyTime: "Novo", bio: "Perfil mockado criado localmente.",
      }),
      name: String(form.get("name")),
      role: String(form.get("role")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      gender: String(form.get("gender")),
      birthDate: String(form.get("birthDate")),
      status: String(form.get("status")) as CrmEmployeeStatus,
      avatar: String(form.get("avatar")) || fallbackAvatar,
    };
    setEmployees((current) => modal?.mode === "edit" ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    setModal(null);
    notify(modal?.mode === "edit" ? "Funcionario atualizado." : "Funcionario adicionado.");
  }

  function toggleStatus(employee: CrmEmployee) {
    const statuses: CrmEmployeeStatus[] = ["Ativo", "Em andamento", "Inativo"];
    const nextStatus = statuses[(statuses.indexOf(employee.status) + 1) % statuses.length];
    setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, status: nextStatus } : item));
    notify(`Status alterado para ${nextStatus}.`);
  }

  function actionMenu(employee: CrmEmployee, icon: "horizontal" | "vertical") {
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpenMenu((current) => current === employee.id ? null : employee.id)} aria-label={`Abrir opcoes de ${employee.name}`} aria-expanded={openMenu === employee.id} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
          {icon === "horizontal" ? <MoreHorizontal className="h-4 w-4" aria-hidden="true" /> : <MoreVertical className="h-4 w-4" aria-hidden="true" />}
        </button>
        {openMenu === employee.id ? <CrmDropdownMenu onClose={() => setOpenMenu(null)} items={[
          { label: "Ver perfil", onSelect: () => setModal({ mode: "details", employee }) },
          { label: "Editar funcionario", onSelect: () => setModal({ mode: "edit", employee }) },
          { label: "Alterar status", onSelect: () => toggleStatus(employee) },
          { label: "Ver projetos", onSelect: () => setModal({ mode: "projects", employee }) },
          { label: "Remover funcionario", danger: true, onSelect: () => setConfirmRemove(employee) },
        ]} /> : null}
      </div>
    );
  }

  const visibleEmployees = activeOnly ? employees.filter((employee) => employee.status === "Ativo") : employees;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <CrmPageHeader title={`Funcionarios (${visibleEmployees.length})`} description={activeOnly ? "Exibindo apenas funcionarios ativos." : undefined} actions={
        <>
          <button type="button" onClick={() => setActiveOnly((current) => !current)} aria-label="Filtrar funcionarios ativos" aria-pressed={activeOnly} className={`rounded-xl border p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${activeOnly ? "border-black bg-black text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}><Filter className="h-4 w-4" aria-hidden="true" /></button>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => setView("list")} aria-label="Visualizar funcionarios em lista" aria-pressed={view === "list"} className={`rounded-lg p-2 transition ${view === "list" ? "bg-black text-white shadow-sm" : "text-slate-400"}`}><List className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => setView("grid")} aria-label="Visualizar funcionarios em grade" aria-pressed={view === "grid"} className={`rounded-lg p-2 transition ${view === "grid" ? "bg-black text-white shadow-sm" : "text-slate-400"}`}><Grid2X2 className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <CrmButton onClick={() => setModal({ mode: "create" })}><Plus className="h-4 w-4" aria-hidden="true" />Adicionar</CrmButton>
        </>
      } />

      {view === "list" ? (
        <CrmCard className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="p-4 font-semibold">Nome completo</th><th className="p-4 font-semibold">Genero</th><th className="p-4 font-semibold">Nascimento</th><th className="p-4 font-semibold">Cargo</th><th className="p-4 font-semibold">Acao</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEmployees.map((employee) => (
                <tr key={employee.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="p-4"><button type="button" onClick={() => setModal({ mode: "details", employee })} className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><CrmAvatar src={employee.avatar} alt={`Foto de ${employee.name}`} size="sm" /><span><span className="block text-sm font-semibold text-slate-800">{employee.name}</span><span className="text-xs text-slate-500">{employee.status}</span></span></button></td>
                  <td className="p-4 text-sm text-slate-600">{employee.gender}</td><td className="p-4 text-sm text-slate-600">{employee.birthDate} <span className="text-slate-400">({employee.age} anos)</span></td><td className="p-4 text-sm text-slate-600">{employee.role}</td><td className="p-4">{actionMenu(employee, "vertical")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CrmCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visibleEmployees.map((employee) => (
            <CrmCard key={employee.id} className="relative flex flex-col items-center p-5 text-center">
              <div className="absolute right-3 top-3">{actionMenu(employee, "horizontal")}</div>
              <button type="button" onClick={() => setModal({ mode: "details", employee })} className="flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><CrmAvatar src={employee.avatar} alt={`Foto de ${employee.name}`} size="lg" className="mb-4 shadow-sm ring-4 ring-slate-100" /><span className="text-sm font-bold text-slate-800">{employee.name}</span><span className="mt-1 text-xs text-slate-500">{employee.role}</span></button>
              <div className="mt-3"><CrmBadge variant={employee.status === "Ativo" ? "green" : employee.status === "Inativo" ? "gray" : "yellow"}>{employee.status}</CrmBadge></div>
              <div className="mt-6 grid w-full grid-cols-3 border-t border-slate-100 pt-4">{[["Projetos", employee.projects], ["Tarefas", employee.tasks], ["Faltas", employee.absences]].map(([label, value]) => <div key={label}><p className="text-sm font-bold text-slate-800">{value}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-slate-400">{label}</p></div>)}</div>
            </CrmCard>
          ))}
        </div>
      )}

      {modal?.mode === "create" || modal?.mode === "edit" ? (
        <CrmModal title={modal.mode === "create" ? "Adicionar funcionario" : "Editar funcionario"} onClose={() => setModal(null)} size="lg">
          <form onSubmit={saveEmployee} className="grid gap-5 sm:grid-cols-2">
            <CrmInput name="name" label="Nome" defaultValue={modal.mode === "edit" ? modal.employee.name : ""} required />
            <CrmInput name="role" label="Cargo" defaultValue={modal.mode === "edit" ? modal.employee.role : ""} required />
            <CrmInput name="email" label="E-mail" type="email" defaultValue={modal.mode === "edit" ? modal.employee.email : ""} required />
            <CrmInput name="phone" label="Telefone" defaultValue={modal.mode === "edit" ? modal.employee.phone : ""} />
            <CrmSelect name="gender" label="Genero" defaultValue={modal.mode === "edit" ? modal.employee.gender : "Nao informado"}><option>Nao informado</option><option>Masculino</option><option>Feminino</option><option>Outro</option></CrmSelect>
            <CrmInput name="birthDate" label="Data de nascimento" defaultValue={modal.mode === "edit" ? modal.employee.birthDate : ""} />
            <CrmSelect name="status" label="Status" defaultValue={modal.mode === "edit" ? modal.employee.status : "Ativo"}><option>Ativo</option><option>Em andamento</option><option>Inativo</option></CrmSelect>
            <CrmInput name="avatar" label="URL do avatar (opcional)" type="url" defaultValue={modal.mode === "edit" ? modal.employee.avatar : ""} />
            <div className="flex justify-end gap-3 sm:col-span-2"><CrmButton variant="secondary" onClick={() => setModal(null)}>Cancelar</CrmButton><CrmButton type="submit">Salvar funcionario</CrmButton></div>
          </form>
        </CrmModal>
      ) : null}

      {modal?.mode === "details" ? (
        <CrmModal title={modal.employee.name} description={modal.employee.role} onClose={() => setModal(null)}>
          <div className="flex gap-4"><CrmAvatar src={modal.employee.avatar} alt={`Foto de ${modal.employee.name}`} size="lg" /><div className="space-y-2 text-sm text-slate-600"><p>{modal.employee.email}</p><p>{modal.employee.phone}</p><p>{modal.employee.location}</p><CrmBadge variant={modal.employee.status === "Ativo" ? "green" : "gray"}>{modal.employee.status}</CrmBadge></div></div>
          <p className="mt-5 text-sm leading-6 text-slate-500">{modal.employee.bio}</p>
          <div className="mt-6 flex justify-end"><CrmButton onClick={() => setModal({ mode: "edit", employee: modal.employee })}>Editar funcionario</CrmButton></div>
        </CrmModal>
      ) : null}

      {modal?.mode === "projects" ? (
        <CrmModal title={`Projetos de ${modal.employee.name}`} onClose={() => setModal(null)}>
          <div className="space-y-3">{crmProjects.slice(0, Math.max(1, Math.min(3, modal.employee.projects))).map((project) => <div key={project.id} className="rounded-xl border border-slate-100 p-4"><p className="text-sm font-semibold text-slate-800">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.company} · {project.status}</p></div>)}</div>
        </CrmModal>
      ) : null}

      {confirmRemove ? <CrmConfirmDialog title="Remover funcionario?" description={`"${confirmRemove.name}" sera removido desta lista mockada.`} confirmLabel="Remover funcionario" danger onConfirm={() => { setEmployees((current) => current.filter((item) => item.id !== confirmRemove.id)); notify("Funcionario removido."); }} onClose={() => setConfirmRemove(null)} /> : null}
      {toast ? <CrmToast message={toast} /> : null}
    </div>
  );
}
