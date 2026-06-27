import type { LucideIcon } from "lucide-react";

export type ClientPortalBadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";
export type ClientProjectStatus = "not_started" | "in_progress" | "waiting_client" | "completed" | "blocked" | "archived";
export type ClientStageStatus = "not_started" | "in_progress" | "waiting_client" | "completed" | "blocked";
export type ClientApprovalStatus = "pending" | "approved" | "changes_requested";
export type ClientRequestStatus = "open" | "in_review" | "answered" | "cancelled";
export type ClientTicketStatus = "open" | "answered" | "waiting_client" | "closed";
export type ClientPriority = "low" | "medium" | "high";

export type ClientPortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type ClientPortalUser = {
  id: number;
  name: string;
  company: string;
  email: string;
  avatar: string;
  currentProjectId: number;
};

export type ClientProjectBlock = {
  id: number;
  title: string;
  description: string;
  status: ClientProjectStatus;
};

export type ClientProject = {
  id: number;
  name: string;
  type: string;
  plan: string;
  status: ClientProjectStatus;
  progress: number;
  currentStage: string;
  nextStage: string;
  estimatedDeadline: string;
  managerId: number;
  briefing: string;
  objective: string;
  audience: string;
  pages: string[];
  features: ClientProjectBlock[];
  integrations: ClientProjectBlock[];
  deliverables: ClientProjectBlock[];
  technologies: string[];
  usefulLinks: { label: string; url: string }[];
  notes: string[];
};

export type ClientProjectStage = {
  id: number;
  order: number;
  title: string;
  description: string;
  status: ClientStageStatus;
  expectedDate: string;
  completedDate?: string;
  responsible: string;
  notes: string;
  requiresApproval: boolean;
};

export type ClientApproval = {
  id: number;
  title: string;
  description: string;
  status: ClientApprovalStatus;
  sentAt: string;
  responsible: string;
  previewLabel: string;
  comment?: string;
};

export type ClientRequest = {
  id: number | string;
  title: string;
  category: "design" | "text" | "feature" | "image" | "deadline" | "other";
  description: string;
  priority: ClientPriority;
  status: ClientRequestStatus;
  createdAt: string;
  response?: string;
  attachmentName?: string;
  attachmentFileAssetId?: string;
  attachmentStatus?: ClientFile["status"];
};

export type ClientFile = {
  id: number | string;
  fileAssetId?: string;
  name: string;
  type: string;
  origin: "Cliente" | "Ateliux";
  date: string;
  size: string;
  status: "available" | "processing" | "pending_review" | "approved" | "rejected" | "deleted";
  context?: string;
  projectId?: string;
  rejectionReason?: string | null;
};

export type ClientPreview = {
  id: number;
  page: string;
  status: "available" | "in_review" | "unavailable";
  updatedAt: string;
  url?: string;
  comments: string[];
};

export type ClientScheduleEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  type: "meeting" | "delivery" | "approval" | "development" | "publication";
  description: string;
  responsible: string;
};

export type ClientTicketMessage = {
  id: number | string;
  author: "Cliente" | "Ateliux";
  message: string;
  sentAt: string;
};

export type ClientSupportTicket = {
  id: number | string;
  subject: string;
  category: string;
  priority: ClientPriority;
  status: ClientTicketStatus;
  updatedAt: string;
  attachmentName?: string;
  attachmentFileAssetId?: string;
  attachmentStatus?: ClientFile["status"];
  messages: ClientTicketMessage[];
};

export type ClientTeamMember = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  responsibilities: string[];
  status: "available" | "busy";
  contactLabel: string;
};

export type ClientInvoice = {
  id: number;
  label: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  paidAt?: string;
};

export type ClientHistoryItem = {
  id: number;
  date: string;
  time: string;
  type: "project" | "approval" | "request" | "file" | "deployment";
  title: string;
  description: string;
  responsible: string;
  status: string;
  relatedHref?: string;
};
