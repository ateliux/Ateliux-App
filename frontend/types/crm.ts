import type { LucideIcon } from "lucide-react";

export type CrmBadgeVariant = "blue" | "green" | "gray" | "red" | "yellow";
export type CrmEmployeeViewMode = "grid" | "list";
export type CrmEmployeeStatus = "Ativo" | "Em andamento" | "Inativo";
export type CrmProjectStatus = "Concluido" | "Em andamento" | "Em revisao" | "Arquivado";
export type CrmRequestColor = "green" | "red" | "yellow";
export type CrmTaskStatus = "Pendente" | "Em andamento" | "Concluida";
export type CrmTaskPriority = "Baixa" | "Media" | "Alta";
export type CrmEventCategory = "Reuniao" | "Entrega" | "Planejamento" | "Pessoal";

export type CrmNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type CrmUser = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  gender: string;
  birthDate: string;
  age: number;
  status: CrmEmployeeStatus;
  projects: number;
  tasks: number;
  absences: number;
  email: string;
  phone: string;
  location: string;
  companyTime: string;
  bio: string;
};

export type CrmEmployee = CrmUser;

export type CrmProject = {
  id: number;
  name: string;
  company: string;
  date: string;
  budget: number;
  status: CrmProjectStatus;
  icon: string;
  colorClass: string;
  progress: number;
  description: string;
  nextTasks: string[];
  teamIds: number[];
  archived?: boolean;
};

export type CrmEvent = {
  id: number;
  title: string;
  time: string;
  date: string;
  colorClass: string;
  category: CrmEventCategory;
  description: string;
};

export type CrmTask = {
  id: number;
  title: string;
  projectId: number;
  description: string;
  priority: CrmTaskPriority;
  estimatedHours: number;
  assigneeId: number;
  status: CrmTaskStatus;
  elapsedSeconds: number;
};

export type CrmNotification = {
  id: number;
  userId: number;
  message: string;
  time: string;
  read: boolean;
};

export type CrmRequest = {
  id: number;
  type: string;
  date: string;
  status: string;
  color: CrmRequestColor;
};

export type CrmActivity = {
  id: number;
  userId: number;
  message: string;
  time: string;
};

export type CrmProfileTab = "overview" | "projects" | "team";
