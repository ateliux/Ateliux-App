import { apiRequest } from "@/lib/api/client";

export type AdminProjectWorkspaceProject = {
  id: string;
  clientId: string;
  name: string;
  type: string;
  scope: string;
  description?: string | null;
  status: string;
  priority: string;
  progress: number;
  startDate?: string | null;
  deadline?: string | null;
  currentStage?: string | null;
  clientFacingSummary?: string | null;
  internalNotes?: string | null;
  visibleToClient: boolean;
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminProjectWorkspaceClient = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  plan: string;
  status: string;
  responsibleId?: string | null;
  account?: {
    id: string;
    inviteStatus: string;
    lastAccessAt?: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      status: string;
    };
  } | null;
  responsible?: {
    id: string;
    role: string;
    avatarUrl?: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    visibleToClient: boolean;
    updatedAt: string;
  }>;
};

export type AdminProjectWorkspaceTeamMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  primary: boolean;
  source: "manager" | "team";
};

export type AdminProjectWorkspaceItem = {
  id: string;
  clientId?: string | null;
  projectId?: string | null;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  type?: string | null;
  message?: string | null;
  url?: string | null;
  version?: string | null;
  date?: string | null;
  dueDate?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  installment?: string | null;
  visibility?: string | null;
  visibleToClient?: boolean | null;
  priority?: string | null;
  response?: string | null;
  originalName?: string | null;
  size?: number | null;
  mimeType?: string | null;
  context?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sentAt?: string | null;
  respondedAt?: string | null;
  [key: string]: unknown;
};

export type AdminProjectWorkspaceStats = {
  teamMembers: number;
  stages: number;
  briefings: number;
  pendingApprovals: number;
  pendingFiles: number;
  openRequests: number;
  upcomingEvents: number;
  pendingPayments: number;
  historyEvents: number;
  inboxThreads: number;
};

export type AdminProjectWorkspacePermissions = {
  canViewWorkspace: boolean;
  canEditProject: boolean;
  canEditTeam: boolean;
  canEditFinance: boolean;
  canEditFiles: boolean;
  canEditStages: boolean;
  canEditBriefings: boolean;
  canManageTeam: boolean;
  canManageScope: boolean;
  canManageStages: boolean;
  canManageBriefings: boolean;
  canManageFiles: boolean;
  canManageApprovals: boolean;
  canManagePreviews: boolean;
  canManageSchedule: boolean;
  canViewFinance: boolean;
  canManageFinance: boolean;
  canManageHistory: boolean;
  canManagePortalSettings: boolean;
  canViewSupport: boolean;
};

export type AdminProjectWorkspace = {
  project: AdminProjectWorkspaceProject;
  client: AdminProjectWorkspaceClient;
  team: AdminProjectWorkspaceTeamMember[];
  stages: AdminProjectWorkspaceItem[];
  briefings: AdminProjectWorkspaceItem[];
  files: AdminProjectWorkspaceItem[];
  approvals: AdminProjectWorkspaceItem[];
  previews: AdminProjectWorkspaceItem[];
  schedule: AdminProjectWorkspaceItem[];
  finance: AdminProjectWorkspaceItem[];
  history: AdminProjectWorkspaceItem[];
  requests: AdminProjectWorkspaceItem[];
  inbox: AdminProjectWorkspaceItem[];
  stats: AdminProjectWorkspaceStats;
  permissions: AdminProjectWorkspacePermissions;
};

export function getAdminProjectWorkspace(projectId: string) {
  return apiRequest<AdminProjectWorkspace>(`/admin/projects/${projectId}/overview`);
}
