import { apiRequest } from "@/lib/api/client";

export type ContactLeadInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  currentSite?: string;
  skills?: string;
  message: string;
  fileAssetId?: string;
};

export function createContactLead(input: ContactLeadInput) {
  return apiRequest<{ id: string }>("/contact", {
    method: "POST",
    json: input,
  });
}
