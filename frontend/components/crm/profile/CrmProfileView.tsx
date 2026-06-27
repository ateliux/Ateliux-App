"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, CheckCircle2, Mail, MapPin, Phone, Plus } from "lucide-react";
import { crmProjects, crmRequests, crmUsers } from "@/data/crm/crm-mock-data";
import type { CrmBadgeVariant, CrmProfileTab, CrmRequestColor, CrmUser } from "@/types/crm";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";
import { CrmBadge } from "@/components/crm/ui/CrmBadge";
import { CrmButton } from "@/components/crm/ui/CrmButton";
import { CrmCard } from "@/components/crm/ui/CrmCard";
import { CrmInput, CrmTextarea } from "@/components/crm/ui/CrmFields";
import { CrmModal } from "@/components/crm/ui/CrmModal";
import { CrmToast } from "@/components/crm/ui/CrmToast";
import { CrmNotificationsPanel } from "@/components/crm/layout/CrmNotificationsPanel";

const profileTabs: { label: string; href: string; id: CrmProfileTab }[] = [
  { label: "Visao geral", href: "/crm/perfil", id: "overview" },
  { label: "Projetos", href: "/crm/perfil/projetos", id: "projects" },
  { label: "Equipe", href: "/crm/perfil/equipe", id: "team" },
];

const requestColorClasses: Record<CrmRequestColor, string> = { green: "bg-emerald-500", yellow: "bg-amber-400", red: "bg-rose-500" };
const requestBadgeVariants: Record<CrmRequestColor, CrmBadgeVariant> = { green: "green", yellow: "yellow", red: "red" };

function ProfileInfoCard({ user }: { user: CrmUser }) {
  return (
    <CrmCard className="p-5 sm:p-6">
      <div className="flex flex-col items-center border-b border-slate-100 pb-6 text-center">
        <CrmAvatar src={user.avatar} alt={`Foto de ${user.name}`} size="xl" className="mb-4 shadow-md ring-4 ring-slate-100" />
        <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
        <p className="mt-1 text-sm font-medium text-black">{user.role}</p>
        <p className="mt-3 text-xs leading-5 text-slate-500">{user.bio}</p>
      </div>
      <div className="space-y-4 border-b border-slate-100 py-6 text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Informacoes principais</p>
        <div className="flex items-center gap-3 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />{user.location}</div>
        <div className="flex justify-between"><span className="text-slate-500">Idade</span><strong className="text-slate-800">{user.age} anos</strong></div>
        <div className="flex justify-between"><span className="text-slate-500">Tempo de empresa</span><strong className="text-slate-800">{user.companyTime}</strong></div>
      </div>
      <div className="space-y-4 pt-6 text-sm text-slate-600">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Contato</p>
        <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />{user.email}</div>
        <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />{user.phone}</div>
      </div>
    </CrmCard>
  );
}

function OverviewContent() {
  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projetos feitos", value: "12", icon: BriefcaseBusiness, className: "bg-slate-100 text-black" },
          { label: "Tarefas concluidas", value: "42", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-500" },
          { label: "Horas semanais", value: "32", icon: CheckCircle2, className: "bg-violet-50 text-violet-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div><p className="text-2xl font-bold text-slate-800">{item.value}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-slate-400">{item.label}</p></div>
            <span className={`grid h-11 w-11 place-items-center rounded-full ${item.className}`}><item.icon className="h-5 w-5" aria-hidden="true" /></span>
          </div>
        ))}
      </div>
      <h2 className="mb-4 font-bold text-slate-800">Meus pedidos recentes</h2>
      <div className="space-y-3">
        {crmRequests.map((request) => (
          <div key={request.id} className="grid gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${requestColorClasses[request.color]}`} /><span className="text-sm font-semibold text-slate-800">{request.type}</span></div>
            <span className="text-xs text-slate-500">{request.date}</span>
            <CrmBadge variant={requestBadgeVariants[request.color]}>{request.status}</CrmBadge>
          </div>
        ))}
      </div>
    </>
  );
}

function ProjectsContent() {
  return (
    <>
      <div className="mb-5 flex items-center justify-between"><h2 className="font-bold text-slate-800">Projetos atuais ({crmProjects.length})</h2><Link href="/crm/projetos" className="inline-flex items-center gap-1 text-sm font-semibold text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><Plus className="h-4 w-4" aria-hidden="true" />Novo</Link></div>
      <div className="space-y-4">
        {crmProjects.map((project) => (
          <div key={project.id} className="grid gap-4 rounded-xl border border-slate-100 p-4 sm:grid-cols-[1fr_160px_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg font-bold ${project.colorClass}`}>{project.icon}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{project.name}</p><p className="truncate text-xs text-slate-500">{project.company}</p></div></div>
            <div><div className="mb-1 flex justify-between text-[10px] text-slate-500"><span>Progresso</span><strong>{project.progress}%</strong></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-black" style={{ width: `${project.progress}%` }} /></div></div>
            <strong className="text-sm text-slate-800">${project.budget}</strong>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamContent() {
  return (
    <>
      <h2 className="mb-5 font-bold text-slate-800">Membros da equipe de design ({crmUsers.length})</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {crmUsers.map((user) => <div key={user.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"><CrmAvatar src={user.avatar} alt={`Foto de ${user.name}`} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user.name}</p><p className="truncate text-xs text-slate-500">{user.role}</p></div></div>)}
      </div>
    </>
  );
}

export function CrmProfileView({ activeTab, showNotifications = false }: { activeTab: CrmProfileTab; showNotifications?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<CrmUser>(crmUsers[0]);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setUser((current) => ({
      ...current,
      name: String(form.get("name")),
      role: String(form.get("role")),
      location: String(form.get("location")),
      phone: String(form.get("phone")),
      email: String(form.get("email")),
      companyTime: String(form.get("companyTime")),
      bio: String(form.get("bio")),
    }));
    setEditing(false);
    setToast("Perfil atualizado com sucesso.");
    window.setTimeout(() => setToast(""), 2800);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <ProfileInfoCard user={user} />
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-bold text-slate-800">Meu perfil</h1><button type="button" onClick={() => setEditing(true)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-black hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">Editar perfil</button></div>
          <nav className="mb-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1" aria-label="Abas do perfil">{profileTabs.map((tab) => <Link key={tab.id} href={tab.href} aria-current={activeTab === tab.id ? "page" : undefined} className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${activeTab === tab.id ? "bg-black text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{tab.label}</Link>)}</nav>
          <CrmCard className="p-5 sm:p-6">{activeTab === "overview" ? <OverviewContent /> : activeTab === "projects" ? <ProjectsContent /> : <TeamContent />}</CrmCard>
        </div>
      </div>
      {showNotifications ? <CrmNotificationsPanel onClose={() => router.push("/crm/perfil")} /> : null}
      {editing ? (
        <CrmModal title="Editar perfil" description="As alteracoes ficam apenas nesta tela enquanto o CRM estiver mockado." onClose={() => setEditing(false)} size="lg">
          <form onSubmit={saveProfile} className="grid gap-5 sm:grid-cols-2">
            <CrmInput name="name" label="Nome" defaultValue={user.name} required />
            <CrmInput name="role" label="Cargo" defaultValue={user.role} required />
            <CrmInput name="location" label="Localizacao" defaultValue={user.location} />
            <CrmInput name="companyTime" label="Tempo de empresa" defaultValue={user.companyTime} />
            <CrmInput name="email" label="E-mail" type="email" defaultValue={user.email} required />
            <CrmInput name="phone" label="Telefone" defaultValue={user.phone} />
            <CrmTextarea name="bio" label="Bio / observacao" defaultValue={user.bio} rows={3} className="sm:col-span-2" />
            <div className="flex justify-end gap-3 sm:col-span-2"><CrmButton variant="secondary" onClick={() => setEditing(false)}>Cancelar</CrmButton><CrmButton type="submit">Salvar alteracoes</CrmButton></div>
          </form>
        </CrmModal>
      ) : null}
      {toast ? <CrmToast message={toast} /> : null}
    </div>
  );
}
