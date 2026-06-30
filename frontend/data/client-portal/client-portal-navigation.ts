import {
  BadgeDollarSign,
  Bookmark,
  CalendarDays,
  CheckSquare,
  Clock3,
  FileStack,
  FolderOpen,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MonitorPlay,
  Send,
  Users,
} from "lucide-react";
import type { ClientPortalNavItem } from "@/types/client-portal";

export const clientPortalNavigation: ClientPortalNavItem[] = [
  { label: "Visao geral", href: "/cliente/visao-geral", icon: LayoutDashboard },
  { label: "Meu projeto", href: "/cliente/projeto", icon: FolderOpen },
  { label: "Etapas", href: "/cliente/etapas", icon: ListChecks },
  { label: "Aprovacoes", href: "/cliente/aprovacoes", icon: CheckSquare },
  { label: "Solicitacoes", href: "/cliente/solicitacoes", icon: Send },
  { label: "Arquivos", href: "/cliente/arquivos", icon: FileStack },
  { label: "Artigos salvos", href: "/cliente/artigos-salvos", icon: Bookmark },
  { label: "Previa", href: "/cliente/previa", icon: MonitorPlay },
  { label: "Cronograma", href: "/cliente/cronograma", icon: CalendarDays },
  { label: "Suporte", href: "/cliente/suporte", icon: LifeBuoy },
  { label: "Equipe", href: "/cliente/equipe", icon: Users },
  { label: "Financeiro", href: "/cliente/financeiro", icon: BadgeDollarSign },
  { label: "Historico", href: "/cliente/historico", icon: History },
];

export const clientPortalQuickLinks = [
  { label: "Aprovacoes", href: "/cliente/aprovacoes", icon: CheckSquare },
  { label: "Arquivos", href: "/cliente/arquivos", icon: FileStack },
  { label: "Artigos salvos", href: "/cliente/artigos-salvos", icon: Bookmark },
  { label: "Cronograma", href: "/cliente/cronograma", icon: Clock3 },
  { label: "Suporte", href: "/cliente/suporte", icon: LifeBuoy },
] as const;
