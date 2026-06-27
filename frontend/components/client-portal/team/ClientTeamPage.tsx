"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircleMore } from "lucide-react";
import { clientTeam } from "@/data/client-portal/client-portal-mock-data";
import type { ClientTeamMember } from "@/types/client-portal";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";

export function ClientTeamPage() {
  const [selected, setSelected] = useState<ClientTeamMember | null>(null);
  return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Pessoas responsaveis" title="Equipe Ateliux" description="Conheca quem participa do seu projeto e o papel de cada especialista." actions={<Link href="/cliente/suporte" className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white"><MessageCircleMore className="h-4 w-4" />Falar com suporte</Link>} /><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{clientTeam.map((member) => <ClientPortalCard key={member.id} className="flex flex-col p-6"><div className="flex items-start justify-between gap-4"><CrmAvatar src={member.avatar} alt={`Foto de ${member.name}`} size="lg" /><ClientPortalBadge variant={member.status === "available" ? "success" : "warning"}>{member.status === "available" ? "Disponivel" : "Em atividade"}</ClientPortalBadge></div><h2 className="mt-5 font-bold text-slate-900">{member.name}</h2><p className="mt-1 text-sm text-slate-500">{member.role}</p><p className="mt-3 text-xs font-semibold text-slate-400">{member.contactLabel}</p><ul className="mt-4 space-y-2">{member.responsibilities.slice(0, 2).map((item) => <li key={item} className="flex gap-2 text-xs text-slate-600"><CheckCircle2 className="h-4 w-4 text-slate-400" />{item}</li>)}</ul><ClientPortalButton variant="secondary" className="mt-5 w-full" onClick={() => setSelected(member)}>Ver responsabilidades<ArrowRight className="h-4 w-4" /></ClientPortalButton></ClientPortalCard>)}</div>{selected ? <ClientPortalModal title={selected.name} description={selected.role} onClose={() => setSelected(null)}><div className="flex gap-4"><CrmAvatar src={selected.avatar} alt={`Foto de ${selected.name}`} size="lg" /><div><ClientPortalBadge variant={selected.status === "available" ? "success" : "warning"}>{selected.status === "available" ? "Disponivel" : "Em atividade"}</ClientPortalBadge><p className="mt-3 text-xs text-slate-500">{selected.contactLabel}</p></div></div><h3 className="mt-6 text-sm font-bold text-slate-900">Responsabilidades no projeto</h3><ul className="mt-3 space-y-3">{selected.responsibilities.map((item) => <li key={item} className="flex gap-3 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />{item}</li>)}</ul><div className="mt-6 flex justify-end"><Link href="/cliente/suporte" className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Falar com suporte</Link></div></ClientPortalModal> : null}</div>;
}
