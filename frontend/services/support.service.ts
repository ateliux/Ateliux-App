import { apiRequest } from "@/lib/api/client";

export type PublicSupportTicketInput = {
  name: string;
  email: string;
  company?: string;
  subject: string;
  category: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  message: string;
};

export function createPublicSupportTicket(input: PublicSupportTicketInput) {
  return apiRequest<{ id: string }>("/support/tickets", {
    method: "POST",
    json: input,
  });
}
