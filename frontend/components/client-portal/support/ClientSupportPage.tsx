"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Clock3, LifeBuoy, Mail, MessageSquarePlus, Paperclip } from "lucide-react";
import { clientSupportTickets as initialTickets } from "@/data/client-portal/client-portal-mock-data";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import type { ClientPriority, ClientSupportTicket, ClientTicketStatus } from "@/types/client-portal";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalInput, ClientPortalSelect, ClientPortalTextarea } from "@/components/client-portal/ui/ClientPortalFields";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { ClientPortalToast } from "@/components/client-portal/ui/ClientPortalToast";
import { statusVariant, ticketStatusLabel } from "@/components/client-portal/ui/client-portal-status";
import { uploadSupportAttachment } from "@/services/client-files.service";
import {
  closeClientSupportTicket,
  createClientSupportTicket,
  listClientSupportTickets,
  replyClientSupportTicket,
} from "@/services/client-support.service";

const priorityLabel: Record<ClientPriority, string> = { low: "Baixa", medium: "Media", high: "Alta" };

export function ClientSupportPage() {
  const [tickets, setTickets] = useState<ClientSupportTicket[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [filter, setFilter] = useState<"all" | ClientTicketStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<ClientSupportTicket["id"] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const visible = filter === "all" ? tickets : tickets.filter((ticket) => ticket.status === filter);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await listClientSupportTickets();
      setTickets(items);
      setSource("api");
    } catch (requestError) {
      if (canUseDevFallback("frontend/client-support")) {
        setTickets(initialTickets);
        setSource("mock");
      } else {
        setTickets([]);
        setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar suporte.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTickets();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadTickets]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const attachment = form.get("attachment");
    let attachmentName: string | undefined;
    let attachmentFileAssetId: string | undefined;

    setSubmitting(true);
    try {
      if (attachment instanceof File && attachment.name) {
        const uploaded = await uploadSupportAttachment(attachment);
        attachmentName = uploaded.name;
        attachmentFileAssetId = uploaded.fileAssetId;
      }

      const ticket = await createClientSupportTicket({
        subject: String(form.get("subject")),
        category: String(form.get("category")),
        priority: String(form.get("priority")) as ClientPriority,
        message: String(form.get("message")),
        fileAssetIds: attachmentFileAssetId ? [attachmentFileAssetId] : undefined,
      });

      setTickets((current) => [ticket, ...current]);
      setSource("api");
      setCreating(false);
      notify(attachmentName ? "Ticket aberto com anexo enviado para revisao." : "Ticket aberto com sucesso.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Nao foi possivel abrir o ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    const message = String(new FormData(event.currentTarget).get("message"));
    try {
      if (source === "api") await replyClientSupportTicket(selected.id, message);
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === selected.id
            ? {
                ...ticket,
                status: "open",
                updatedAt: new Intl.DateTimeFormat("pt-BR").format(new Date()),
                messages: [
                  ...ticket.messages,
                  {
                    id: Date.now(),
                    author: "Cliente",
                    message,
                    sentAt: `${new Intl.DateTimeFormat("pt-BR").format(new Date())} agora`,
                  },
                ],
              }
            : ticket,
        ),
      );
      event.currentTarget.reset();
      notify("Resposta adicionada ao ticket.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Nao foi possivel responder o ticket.");
    }
  }

  async function toggleClosed(ticket: ClientSupportTicket) {
    const closed = ticket.status !== "closed";
    try {
      if (source === "api" && closed) await closeClientSupportTicket(ticket.id);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? { ...item, status: closed ? "closed" : "open" } : item)));
      notify(closed ? "Ticket encerrado." : "Ticket reaberto.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Nao foi possivel atualizar o ticket.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <ClientPortalPageHeader
        eyebrow="Canal direto com a Ateliux"
        title="Suporte"
        description="Centralize duvidas e mensagens relacionadas ao projeto."
        actions={<ClientPortalButton onClick={() => setCreating(true)}><MessageSquarePlus className="h-4 w-4" />Nova mensagem</ClientPortalButton>}
      />

      {source === "mock" ? (
        <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Usando fallback de desenvolvimento porque a API nao respondeu.
        </p>
      ) : null}

      {loading ? <LoadingState title="Carregando suporte" /> : null}
      {!loading && error ? <ErrorState description={error} onRetry={loadTickets} /> : null}

      {!loading && !error ? <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {([
              { label: "Todos", value: "all" },
              { label: "Abertos", value: "open" },
              { label: "Respondidos", value: "answered" },
              { label: "Aguardando voce", value: "waiting_client" },
              { label: "Encerrados", value: "closed" },
            ] as const).map((item) => (
              <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-xl px-4 py-2 text-xs font-semibold ${filter === item.value ? "bg-black text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {visible.length ? visible.map((ticket) => (
              <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                <ClientPortalCard className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <ClientPortalBadge variant={statusVariant(ticket.status)}>{ticketStatusLabel[ticket.status]}</ClientPortalBadge>
                        <ClientPortalBadge>{priorityLabel[ticket.priority]}</ClientPortalBadge>
                      </div>
                      <h2 className="mt-3 font-bold text-slate-900">{ticket.subject}</h2>
                      <p className="mt-1 text-xs text-slate-400">{ticket.category} - atualizado em {ticket.updatedAt}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{ticket.messages.length} mensagens</span>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{ticket.messages.at(-1)?.message}</p>
                </ClientPortalCard>
              </button>
            )) : <EmptyState title="Nenhum ticket encontrado." description="Abra uma nova mensagem para falar com a Ateliux." />}
          </div>
        </div>

        <aside className="space-y-4">
          <ClientPortalCard className="p-5">
            <LifeBuoy className="h-6 w-6" />
            <h2 className="mt-4 font-bold text-slate-900">Atendimento</h2>
            <div className="mt-4 space-y-4 text-xs text-slate-500">
              <div className="flex gap-3"><Clock3 className="h-4 w-4 shrink-0" /><span>Segunda a sexta<br /><strong className="text-slate-800">9h as 18h</strong></span></div>
              <div className="flex gap-3"><Mail className="h-4 w-4 shrink-0" /><span>Resposta media<br /><strong className="text-slate-800">Ate 4 horas uteis</strong></span></div>
            </div>
          </ClientPortalCard>
          <ClientPortalCard className="bg-black p-5 text-white">
            <p className="text-xs text-zinc-400">Contato principal</p>
            <p className="mt-2 font-semibold">Emily Tyler</p>
            <p className="text-xs text-zinc-400">Suporte ao cliente</p>
          </ClientPortalCard>
        </aside>
      </div> : null}

      {creating ? (
        <ClientPortalModal title="Nova mensagem" description="Abra um ticket relacionado ao seu projeto. Anexos passam pelo upload seguro antes do ticket ser criado." onClose={() => setCreating(false)} size="lg">
          <form onSubmit={create} className="grid gap-5 sm:grid-cols-2">
            <ClientPortalInput name="subject" label="Assunto" required />
            <ClientPortalSelect name="category" label="Categoria" defaultValue="Projeto"><option>Projeto</option><option>Conteudo</option><option>Tecnico</option><option>Financeiro</option><option>Outro</option></ClientPortalSelect>
            <ClientPortalSelect name="priority" label="Prioridade" defaultValue="medium"><option value="low">Baixa</option><option value="medium">Media</option><option value="high">Alta</option></ClientPortalSelect>
            <ClientPortalInput name="attachment" label="Anexo opcional" type="file" />
            <div className="sm:col-span-2"><ClientPortalTextarea name="message" label="Mensagem" rows={5} required /></div>
            <div className="flex justify-end gap-3 sm:col-span-2"><ClientPortalButton variant="secondary" onClick={() => setCreating(false)}>Cancelar</ClientPortalButton><ClientPortalButton type="submit" disabled={submitting}>{submitting ? "Enviando..." : "Abrir ticket"}</ClientPortalButton></div>
          </form>
        </ClientPortalModal>
      ) : null}

      {selected ? (
        <ClientPortalModal title={selected.subject} description={`${selected.category} - ${ticketStatusLabel[selected.status]}`} onClose={() => setSelectedId(null)} size="lg">
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {selected.messages.map((message) => (
              <div key={message.id} className={`rounded-xl p-4 ${message.author === "Cliente" ? "ml-8 bg-black text-white" : "mr-8 bg-slate-100 text-slate-700"}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{message.author} - {message.sentAt}</p>
                <p className="mt-2 text-sm leading-6">{message.message}</p>
              </div>
            ))}
          </div>
          {selected.attachmentName ? <p className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><Paperclip className="h-4 w-4" />{selected.attachmentName}</p> : null}
          {selected.status !== "closed" ? (
            <form onSubmit={reply} className="mt-5 space-y-3">
              <ClientPortalTextarea name="message" label="Responder" rows={3} required />
              <div className="flex justify-end gap-3"><ClientPortalButton variant="secondary" onClick={() => toggleClosed(selected)}>Encerrar ticket</ClientPortalButton><ClientPortalButton type="submit">Enviar resposta</ClientPortalButton></div>
            </form>
          ) : (
            <div className="mt-5 flex justify-end"><ClientPortalButton onClick={() => toggleClosed(selected)}>Reabrir ticket</ClientPortalButton></div>
          )}
        </ClientPortalModal>
      ) : null}

      {toast ? <ClientPortalToast message={toast} /> : null}
    </div>
  );
}
