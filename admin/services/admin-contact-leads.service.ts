import { apiRequest } from "@/lib/api/client";

export type ContactLeadDto = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  projectType?: string | null;
  budget?: string | null;
  timeline?: string | null;
  currentSite?: string | null;
  skills?: string | null;
  message: string;
  fileAssetId?: string | null;
  status: "NEW" | "IN_REVIEW" | "CONTACTED" | "CONVERTED" | "ARCHIVED";
  createdAt: string;
};

export function listContactLeads() {
  return apiRequest<ContactLeadDto[]>("/admin/contact-leads");
}

export function getContactLead(id: string) {
  return apiRequest<ContactLeadDto>(`/admin/contact-leads/${id}`);
}

export function updateContactLead(id: string, input: Partial<Pick<ContactLeadDto, "status" | "phone" | "company" | "message">>) {
  return apiRequest<ContactLeadDto>(`/admin/contact-leads/${id}`, {
    method: "PATCH",
    json: input,
  });
}

export function convertContactLeadToClient(id: string) {
  return apiRequest<unknown>(`/admin/contact-leads/${id}/convert-to-client`, {
    method: "POST",
  });
}

export function replyContactLead(id: string) {
  return apiRequest<unknown>(`/admin/contact-leads/${id}/reply`, {
    method: "POST",
  });
}
