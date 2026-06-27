"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircleMore } from "lucide-react";
import { clientTeam } from "@/data/client-portal/client-portal-mock-data";
import { toClientTeamMember } from "@/lib/client-portal/api-adapters";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { listClientTeam } from "@/services/client-team.service";
import type { ClientTeamMember } from "@/types/client-portal";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { CrmAvatar } from "@/components/crm/ui/CrmAvatar";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";

function MemberAvatar({ member, size = "lg" }: { member: ClientTeamMember; size?: "md" | "lg" }) {
  if (member.avatar) return <CrmAvatar src={member.avatar} alt={`Foto de ${member.name}`} size={size} />;
  const dimension = size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const initials = member.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";
  return <span className={`grid ${dimension} shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white`}>{initials}</span>;
}

export function ClientTeamPage() {
  const [members, setMembers] = useState<ClientTeamMember[]>([]);
  const [selected, setSelected] = useState<ClientTeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listClientTeam<Record<string, unknown>>();
      setMembers(response.map(toClientTeamMember));
    } catch (loadError) {
      if (canUseDevFallback("frontend/client-team")) {
        setMembers(clientTeam);
      } else {
        setMembers([]);
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar a equipe.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTeam();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadTeam]);

  return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Pessoas responsaveis" title="Equipe Ateliux" description="Conheca quem participa do seu projeto e o papel de cada especialista." actions={<Link href="/cliente/suporte" className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white"><MessageCircleMore className="h-4 w-4" />Falar com suporte</Link>} />{loading ? <LoadingState title="Carregando equipe" /> : error ? <ErrorState title="Nao foi possivel carregar a equipe" description={error} onRetry={loadTeam} /> : members.length === 0 ? <EmptyState title="Nenhuma equipe vinculada" description="Quando um responsavel for vinculado ao seu projeto, ele aparecera aqui." /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{members.map((member) => <ClientPortalCard key={member.apiId ?? member.id} className="flex flex-col p-6"><div className="flex items-start justify-between gap-4"><MemberAvatar member={member} /><ClientPortalBadge variant={member.status === "available" ? "success" : "warning"}>{member.status === "available" ? "Disponivel" : "Em atividade"}</ClientPortalBadge></div><h2 className="mt-5 font-bold text-slate-900">{member.name}</h2><p className="mt-1 text-sm text-slate-500">{member.role}</p><p className="mt-3 text-xs font-semibold text-slate-400">{member.contactLabel}</p>{member.projectName ? <p className="mt-2 text-xs text-slate-500">Projeto: {member.projectName}</p> : null}<ul className="mt-4 space-y-2">{member.responsibilities.slice(0, 2).map((item) => <li key={item} className="flex gap-2 text-xs text-slate-600"><CheckCircle2 className="h-4 w-4 text-slate-400" />{item}</li>)}</ul><ClientPortalButton variant="secondary" className="mt-5 w-full" onClick={() => setSelected(member)}>Ver responsabilidades<ArrowRight className="h-4 w-4" /></ClientPortalButton></ClientPortalCard>)}</div>}{selected ? <ClientPortalModal title={selected.name} description={selected.role} onClose={() => setSelected(null)}><div className="flex gap-4"><MemberAvatar member={selected} /><div><ClientPortalBadge variant={selected.status === "available" ? "success" : "warning"}>{selected.status === "available" ? "Disponivel" : "Em atividade"}</ClientPortalBadge><p className="mt-3 text-xs text-slate-500">{selected.contactLabel}</p></div></div><h3 className="mt-6 text-sm font-bold text-slate-900">Responsabilidades no projeto</h3><ul className="mt-3 space-y-3">{selected.responsibilities.map((item) => <li key={item} className="flex gap-3 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />{item}</li>)}</ul>{selected.areas?.length ? <div className="mt-5 flex flex-wrap gap-2">{selected.areas.map((area) => <ClientPortalBadge key={area}>{area}</ClientPortalBadge>)}</div> : null}<div className="mt-6 flex justify-end"><Link href="/cliente/suporte" className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Falar com suporte</Link></div></ClientPortalModal> : null}</div>;
}
