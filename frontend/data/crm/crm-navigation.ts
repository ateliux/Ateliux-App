import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { CrmNavItem } from "@/types/crm";

export const crmNavigation: CrmNavItem[] = [
  { label: "Painel", href: "/crm/visao-geral", icon: LayoutDashboard },
  { label: "Calendario", href: "/crm/calendario", icon: CalendarDays },
  { label: "Projetos", href: "/crm/projetos", icon: BriefcaseBusiness },
  { label: "Funcionarios", href: "/crm/funcionarios", icon: Users },
  { label: "Rastreador", href: "/crm/rastreador-de-tempo", icon: Clock3 },
];

