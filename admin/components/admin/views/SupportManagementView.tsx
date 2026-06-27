"use client";

import { CheckCircle2, FilePlus2, MessageSquare, RefreshCcw, Send, Search, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { PORTAL_REQUESTS, SUPPORT_TICKETS } from "@/data/admin/admin-mock-data";
import type { SupportPriority, SupportTicket, SupportTicketStatus } from "@/types/admin";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Badge } from "@/components/admin/ui/Badge";

const statusVariant: Record<SupportTicketStatus, "green" | "yellow" | "blue" | "gray"> = {
  Aberto: "yellow",
  Respondido: "blue",
  "Aguardando cliente": "gray",
  Encerrado: "green",
};

const priorityVariant: Record<SupportPriority, "green" | "yellow" | "red" | "gray"> = {
  Baixa: "gray",
  Media: "yellow",
  Alta: "red",
  Urgente: "red",
};

const priorities: readonly SupportPriority[] = ["Baixa", "Media", "Alta", "Urgente"];
const statuses: readonly SupportTicketStatus[] = ["Aberto", "Respondido", "Aguardando cliente", "Encerrado"];
const responsibles = ["Mia Torres", "Olivia Mason", "Ethan Ray", "Lina Armand", "Jacob Yuan"];

function requestsAsTickets(): SupportTicket[] {
  return PORTAL_REQUESTS.map((request) => ({
    id: 9000 + request.id,
    code: `REQ-${String(request.id).padStart(4, "0")}`,
    client: request.client,
    subject: request.title,
    category: request.category,
    priority: request.priority,
    status: request.status === "Concluida" ? "Encerrado" : "Aberto",
    createdAt: request.createdAt,
    lastMessage: request.response || "Solicitacao recebida pelo Portal do Cliente.",
    messages: [
      { sender: "Cliente", text: request.title, time: request.createdAt },
      ...(request.response ? [{ sender: "Ateliux" as const, text: request.response, time: "Registrado" }] : []),
    ],
    source: "Portal",
    project: request.project,
    responsible: request.responsible,
    attachments: [],
    convertedToTask: false,
  }));
}

export function SupportManagementView() {
  const [tickets, setTickets] = useState<SupportTicket[]>([...SUPPORT_TICKETS, ...requestsAsTickets()]);
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id ?? 0);
  const [reply, setReply] = useState("");
  const [query, setQuery] = useState("");

  const filteredTickets = useMemo(() => tickets.filter((ticket) => `${ticket.client} ${ticket.subject} ${ticket.code} ${ticket.source}`.toLowerCase().includes(query.toLowerCase())), [tickets, query]);
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0];

  function updateTicket(ticketId: number, patch: Partial<SupportTicket>) {
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...patch } : ticket)));
  }

  function updateStatus(status: SupportTicketStatus) {
    if (!selectedTicket) return;
    updateTicket(selectedTicket.id, { status });
  }

  function sendReply() {
    if (!selectedTicket || !reply.trim()) return;
    updateTicket(selectedTicket.id, {
      status: "Respondido",
      lastMessage: reply,
      messages: [...selectedTicket.messages, { sender: "Ateliux", text: reply, time: "Agora" }],
    });
    setReply("");
  }

  function addMockAttachment() {
    if (!selectedTicket) return;
    const nextAttachment = `anexo-${selectedTicket.attachments?.length ? selectedTicket.attachments.length + 1 : 1}.pdf`;
    updateTicket(selectedTicket.id, {
      attachments: [...(selectedTicket.attachments ?? []), nextAttachment],
      lastMessage: `Anexo mock ${nextAttachment} adicionado ao chamado.`,
    });
  }

  function convertToTask() {
    if (!selectedTicket) return;
    updateTicket(selectedTicket.id, {
      convertedToTask: true,
      status: "Aguardando cliente",
      lastMessage: "Solicitacao convertida em tarefa/etapa interna.",
      messages: [...selectedTicket.messages, { sender: "Ateliux", text: "Convertido em tarefa de etapa para acompanhamento interno.", time: "Agora" }],
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Gerenciamento de suporte</h2>
        <p className="text-sm text-gray-500">Tickets de suporte e solicitacoes do Portal do Cliente em uma caixa unica.</p>
      </div>

      <div className="grid min-h-[720px] grid-cols-1 gap-6 xl:grid-cols-[410px_1fr]">
        <aside className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar chamado..." className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" />
            </div>
          </div>
          <div className="max-h-[660px] overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <button key={ticket.id} type="button" onClick={() => setSelectedTicketId(ticket.id)} className={`w-full border-b border-gray-50 p-4 text-left transition-colors ${ticket.id === selectedTicket?.id ? "bg-[#F4F7F6]" : "hover:bg-gray-50"}`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#00B074]">{ticket.code}</span>
                  <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
                </div>
                <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {ticket.client} - {ticket.source ?? "Suporte"} - {ticket.createdAt}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{ticket.lastMessage}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {selectedTicket ? (
            <>
              <div className="border-b border-gray-100 p-6">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#00B074]">{selectedTicket.code}</p>
                    <h3 className="mt-1 text-xl font-bold text-gray-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedTicket.client} - {selectedTicket.category} - {selectedTicket.project ?? "Sem projeto"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={statusVariant[selectedTicket.status]}>{selectedTicket.status}</Badge>
                    <Badge variant={priorityVariant[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                    <Badge variant={selectedTicket.convertedToTask ? "green" : "gray"}>{selectedTicket.convertedToTask ? "Convertido" : selectedTicket.source ?? "Suporte"}</Badge>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-2 text-xs font-semibold text-gray-500">
                    Status
                    <select value={selectedTicket.status} onChange={(event) => updateStatus(event.target.value as SupportTicketStatus)} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none">
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-xs font-semibold text-gray-500">
                    Prioridade
                    <select value={selectedTicket.priority} onChange={(event) => updateTicket(selectedTicket.id, { priority: event.target.value as SupportPriority })} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none">
                      {priorities.map((priority) => <option key={priority}>{priority}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-xs font-semibold text-gray-500">
                    Responsavel
                    <select value={selectedTicket.responsible ?? responsibles[0]} onChange={(event) => updateTicket(selectedTicket.id, { responsible: event.target.value })} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none">
                      {responsibles.map((responsible) => <option key={responsible}>{responsible}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminButton variant="secondary" onClick={() => updateStatus("Aguardando cliente")}>Aguardar cliente</AdminButton>
                  <AdminButton variant="secondary" onClick={() => updateStatus("Respondido")}>Marcar respondido</AdminButton>
                  <AdminButton variant="secondary" onClick={addMockAttachment}><FilePlus2 className="h-4 w-4" /> Anexo mock</AdminButton>
                  <AdminButton variant="secondary" onClick={convertToTask}><Workflow className="h-4 w-4" /> Converter em tarefa</AdminButton>
                  {selectedTicket.status === "Encerrado" ? (
                    <AdminButton onClick={() => updateStatus("Aberto")}><RefreshCcw className="h-4 w-4" /> Reabrir</AdminButton>
                  ) : (
                    <AdminButton onClick={() => updateStatus("Encerrado")}><CheckCircle2 className="h-4 w-4" /> Encerrar</AdminButton>
                  )}
                </div>

                {selectedTicket.attachments?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTicket.attachments.map((attachment) => (
                      <span key={attachment} className="rounded-lg bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">{attachment}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/40 p-6">
                {selectedTicket.messages.map((message, index) => (
                  <div key={`${message.sender}-${index}`} className={`max-w-2xl rounded-2xl p-4 ${message.sender === "Ateliux" ? "ml-auto bg-[#E6F7F1]" : "bg-white"}`}>
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-gray-700">{message.sender}</span>
                      <span className="text-[10px] text-gray-400">{message.time}</span>
                    </div>
                    <p className="text-sm leading-6 text-gray-700">{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 p-4">
                <div className="relative">
                  <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={4} placeholder="Responder chamado..." className="w-full resize-none rounded-2xl border border-gray-200 p-4 pr-36 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" />
                  <AdminButton onClick={sendReply} className="absolute bottom-4 right-4"><Send className="h-4 w-4" /> Enviar</AdminButton>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400"><MessageSquare className="mb-4 h-12 w-12" /><p>Nenhum chamado selecionado.</p></div>
          )}
        </section>
      </div>
    </div>
  );
}
