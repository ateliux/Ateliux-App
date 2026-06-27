"use client";

import { Archive, CheckCircle2, Download, FileText, MoreVertical, Paperclip, Plus, Search, Send, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_INBOX_CONVERSATIONS, PORTAL_CLIENTS, PORTAL_PROJECTS_SCOPED } from "@/data/admin/admin-mock-data";
import type { AdminInboxAttachment, AdminInboxChannel, AdminInboxConversation, AdminInboxPriority, AdminInboxStatus } from "@/types/admin";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";
import { Modal } from "@/components/admin/ui/Modal";
import {
  deleteAdminInboxConversation,
  listAdminInboxConversations,
  sendAdminInboxMessage,
  updateAdminInboxConversation,
} from "@/services/admin-inbox.service";

const channelTabs: readonly { id: AdminInboxChannel; label: string }[] = [
  { id: "clientes", label: "Clientes" },
  { id: "suporte", label: "Suporte" },
];

const statusLabels: Record<AdminInboxStatus, string> = {
  novo: "Novo",
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  resolvido: "Resolvido",
  arquivado: "Arquivado",
};

const priorityLabels: Record<AdminInboxPriority, string> = {
  baixa: "Baixa",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const sourceLabels: Record<AdminInboxConversation["source"], string> = {
  portal_cliente: "Portal do Cliente",
  suporte: "Suporte",
  aprovacao: "Aprovacao",
  solicitacao: "Solicitacao",
  arquivo: "Arquivo",
  financeiro: "Financeiro",
  cronograma: "Cronograma",
  contato: "Contato",
};

const statusVariant: Record<AdminInboxStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  novo: "yellow",
  aberto: "blue",
  em_atendimento: "blue",
  aguardando_cliente: "gray",
  resolvido: "green",
  arquivado: "gray",
};

const priorityVariant: Record<AdminInboxPriority, "green" | "yellow" | "red" | "gray"> = {
  baixa: "gray",
  media: "yellow",
  alta: "red",
  urgente: "red",
};

const assignOptions = ["Mia Torres", "Olivia Mason", "Ethan Ray", "Lina Armand", "Jacob Yuan"];

function ConversationAvatar({ conversation, size = "h-10 w-10" }: { conversation: AdminInboxConversation; size?: string }) {
  return <Avatar src={conversation.clientAvatarUrl} name={conversation.clientName || conversation.clientCompany} size={size} alt={conversation.clientName || "Cliente"} />;
}

function AttachmentCard({ attachment }: { attachment: AdminInboxAttachment }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500">
        <FileText className="h-5 w-5" />
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-gray-800">{attachment.name}</p>
        <p className="text-[10px] text-gray-500">{attachment.size}</p>
      </div>
      <Download className="ml-4 h-4 w-4 text-gray-400" />
    </div>
  );
}

export function InboxView() {
  const [conversations, setConversations] = useState<AdminInboxConversation[]>([...ADMIN_INBOX_CONVERSATIONS]);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [notice, setNotice] = useState("");
  const [activeChannel, setActiveChannel] = useState<AdminInboxChannel>("clientes");
  const [activeConversationId, setActiveConversationId] = useState(ADMIN_INBOX_CONVERSATIONS.find((conversation) => conversation.channel === "clientes")?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminInboxStatus | "todos">("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [reply, setReply] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<AdminInboxAttachment | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<AdminInboxConversation | null>(null);

  useEffect(() => {
    let active = true;
    listAdminInboxConversations()
      .then((items) => {
        if (!active) return;
        setConversations(items);
        setSource("api");
        const first = items.find((conversation) => conversation.channel === activeChannel) ?? items[0];
        setActiveConversationId(first?.id ?? "");
      })
      .catch(() => {
        if (!active) return;
        setConversations([...ADMIN_INBOX_CONVERSATIONS]);
        setSource("mock");
      });

    return () => {
      active = false;
    };
  }, [activeChannel]);

  const channelCounts = useMemo(() => {
    return {
      clientes: conversations.filter((conversation) => conversation.channel === "clientes").length,
      suporte: conversations.filter((conversation) => conversation.channel === "suporte").length,
    };
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesChannel = conversation.channel === activeChannel;
      const matchesQuery = `${conversation.clientName} ${conversation.clientCompany ?? ""} ${conversation.clientEmail} ${conversation.subject} ${conversation.preview}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "todos" || conversation.status === statusFilter;
      return matchesChannel && matchesQuery && matchesStatus;
    });
  }, [activeChannel, conversations, query, statusFilter]);

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId && conversation.channel === activeChannel) ?? filteredConversations[0];

  function updateConversation(conversationId: string, patch: Partial<AdminInboxConversation>) {
    setConversations((current) => current.map((conversation) => (conversation.id === conversationId ? { ...conversation, ...patch } : conversation)));
    if (source === "api" && (patch.status || patch.priority)) {
      updateAdminInboxConversation(conversationId, { status: patch.status, priority: patch.priority }).catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "Nao foi possivel atualizar a conversa.");
      });
    }
  }

  function selectChannel(channel: AdminInboxChannel) {
    setActiveChannel(channel);
    setStatusFilter("todos");
    setShowActions(false);
    setPendingAttachment(null);
    const firstConversation = conversations.find((conversation) => conversation.channel === channel);
    setActiveConversationId(firstConversation?.id ?? "");
  }

  function selectConversation(conversation: AdminInboxConversation) {
    setActiveConversationId(conversation.id);
    setShowActions(false);
    if (conversation.unread) updateConversation(conversation.id, { unread: false });
  }

  function createConversation() {
    const isClientChannel = activeChannel === "clientes";
    const fallbackClient = PORTAL_CLIENTS[0];
    const fallbackProject = PORTAL_PROJECTS_SCOPED.find((project) => project.clientId === fallbackClient.id);
    const newConversation: AdminInboxConversation = {
      id: `local-${activeChannel}-${Date.now()}`,
      clientId: fallbackClient.id,
      projectId: fallbackProject?.id,
      channel: activeChannel,
      clientName: isClientChannel ? fallbackClient.name : "Novo Usuario",
      clientCompany: isClientChannel ? fallbackClient.company : "Suporte Ateliux",
      clientEmail: isClientChannel ? fallbackClient.email : "usuario@suporte.com",
      projectName: isClientChannel ? fallbackProject?.name : undefined,
      subject: isClientChannel ? "Nova mensagem do cliente" : "Novo chamado de suporte",
      preview: "Conversa criada localmente pela equipe Ateliux.",
      status: "novo",
      priority: "media",
      unread: false,
      assignedTo: "Mia Torres",
      source: isClientChannel ? "portal_cliente" : "suporte",
      createdAt: "Agora",
      updatedAt: "Agora",
      messages: [
        {
          id: `local-message-${Date.now()}`,
          senderId: "sistema",
          body: "Conversa criada localmente para demonstracao do fluxo.",
          createdAt: "Agora",
          from: "sistema",
        },
      ],
    };

    setConversations((current) => [newConversation, ...current]);
    setActiveConversationId(newConversation.id);
  }

  function attachMockFile() {
    setPendingAttachment({
      id: `reply-attachment-${Date.now()}`,
      name: "anexo-ateliux.pdf",
      size: "420 KB",
      type: "PDF",
    });
  }

  async function sendReply() {
    if (!activeConversation || (!reply.trim() && !pendingAttachment)) return;

    const body = reply.trim() || "Arquivo anexado pela equipe Ateliux.";
    try {
      if (source === "api") await sendAdminInboxMessage(activeConversation.id, body);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Nao foi possivel enviar a resposta.");
      return;
    }

    const newMessage = {
      id: `reply-${Date.now()}`,
      senderId: "ateliux",
      body,
      createdAt: "Agora",
      from: "ateliux" as const,
      attachments: pendingAttachment ? [pendingAttachment] : undefined,
    };

    updateConversation(activeConversation.id, {
      messages: [...activeConversation.messages, newMessage],
      preview: body,
      updatedAt: "Agora",
      status: activeConversation.status === "arquivado" ? "em_atendimento" : "em_atendimento",
      unread: false,
    });
    setReply("");
    setPendingAttachment(null);
  }

  async function deleteConversation() {
    if (!conversationToDelete) return;
    if (source === "api") {
      try {
        await deleteAdminInboxConversation(conversationToDelete.id);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Nao foi possivel excluir a conversa.");
        return;
      }
    }

    const nextConversations = conversations.filter((conversation) => conversation.id !== conversationToDelete.id);
    const fallbackConversation = nextConversations.find((conversation) => conversation.channel === activeChannel);
    setConversations(nextConversations);
    setActiveConversationId(fallbackConversation?.id ?? "");
    setConversationToDelete(null);
    setShowActions(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Caixa de Entrada</h2>
          <p className="text-sm text-gray-500">Central de mensagens, solicitacoes e suporte dos clientes Ateliux.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminButton variant="secondary" onClick={() => setShowFilters((current) => !current)}>
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </AdminButton>
          <AdminButton onClick={createConversation}>
            <Plus className="h-4 w-4" /> Nova mensagem
          </AdminButton>
        </div>
      </div>

      {source === "mock" ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          API real indisponivel ou sem sessao admin. Exibindo fallback mockado da caixa de entrada.
        </div>
      ) : null}
      {notice ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{notice}</div> : null}

      <div className="flex h-[calc(100vh-230px)] min-h-[680px] flex-col gap-6 lg:flex-row">
        <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm lg:w-[420px]">
          <div className="border-b border-gray-100 p-4">
            <div className="mb-4 grid grid-cols-2 rounded-2xl bg-gray-50 p-1">
              {channelTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectChannel(tab.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    activeChannel === tab.id ? "bg-[#00B074] text-white shadow-sm shadow-emerald-100" : "text-gray-500 hover:bg-white hover:text-gray-900"
                  }`}
                >
                  {tab.label} <span className="ml-1 opacity-80">{channelCounts[tab.id]}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar mensagens..."
                className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-[#00B074]"
              />
            </div>

            {showFilters ? (
              <div className="mt-4 grid gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <label className="grid gap-1 text-xs font-semibold text-gray-500">
                  Status
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AdminInboxStatus | "todos")} className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
                    <option value="todos">Todos</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length ? (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`flex w-full cursor-pointer gap-4 border-b border-gray-50 p-4 text-left transition-colors ${conversation.id === activeConversation?.id ? "bg-[#F4F7F6]" : "hover:bg-gray-50"}`}
                >
                  <ConversationAvatar conversation={conversation} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <h4 className={`truncate text-sm ${conversation.unread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{conversation.clientName}</h4>
                      <span className="ml-2 whitespace-nowrap text-[10px] text-gray-400">{conversation.updatedAt}</span>
                    </div>
                    <p className="truncate text-[11px] text-gray-400">{conversation.clientCompany}</p>
                    <p className={`mb-1 truncate text-xs ${conversation.unread ? "font-semibold text-gray-800" : "text-gray-500"}`}>{conversation.subject}</p>
                    <p className="truncate text-[11px] text-gray-400">{conversation.preview}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={statusVariant[conversation.status]}>{statusLabels[conversation.status]}</Badge>
                      <Badge variant={priorityVariant[conversation.priority]}>{priorityLabels[conversation.priority]}</Badge>
                    </div>
                  </div>
                  {conversation.unread ? <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#00B074]" /> : null}
                </button>
              ))
            ) : (
              <div className="flex h-full min-h-64 flex-col items-center justify-center p-6 text-center text-gray-400">
                <Search className="mb-3 h-8 w-8 opacity-40" />
                <p className="text-sm font-semibold">Nenhuma conversa encontrada.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {activeConversation ? (
            <>
              <div className="border-b border-gray-100 p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <ConversationAvatar conversation={activeConversation} size="h-12 w-12" />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-gray-900">{activeConversation.subject}</h3>
                      <p className="text-sm text-gray-500">
                        {activeConversation.clientName}
                        {activeConversation.clientCompany ? ` - ${activeConversation.clientCompany}` : ""} - {activeConversation.clientEmail}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Projeto: {activeConversation.projectName ?? "Sem projeto"} - Origem: {sourceLabels[activeConversation.source]}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant[activeConversation.status]}>{statusLabels[activeConversation.status]}</Badge>
                    <Badge variant={priorityVariant[activeConversation.priority]}>{priorityLabels[activeConversation.priority]}</Badge>
                    <button type="button" onClick={() => setShowActions((current) => !current)} className="rounded-lg bg-gray-50 p-2 text-gray-400 hover:text-gray-600" aria-label="Abrir acoes da conversa">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {showActions ? (
                  <div className="mt-5 grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:grid-cols-[1fr_1fr_1fr_auto_auto_auto]">
                    <label className="grid gap-1 text-xs font-semibold text-gray-500">
                      Responsavel
                      <select value={activeConversation.assignedTo ?? ""} onChange={(event) => updateConversation(activeConversation.id, { assignedTo: event.target.value })} className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
                        {assignOptions.map((name) => <option key={name}>{name}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-gray-500">
                      Status
                      <select value={activeConversation.status} onChange={(event) => updateConversation(activeConversation.id, { status: event.target.value as AdminInboxStatus })} className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-gray-500">
                      Prioridade
                      <select value={activeConversation.priority} onChange={(event) => updateConversation(activeConversation.id, { priority: event.target.value as AdminInboxPriority })} className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none">
                        {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <AdminButton variant="secondary" onClick={() => updateConversation(activeConversation.id, { status: "arquivado", unread: false })}><Archive className="h-4 w-4" /> Arquivar</AdminButton>
                    <AdminButton onClick={() => updateConversation(activeConversation.id, { status: "resolvido", unread: false })}><CheckCircle2 className="h-4 w-4" /> Encerrar</AdminButton>
                    <AdminButton variant="danger" onClick={() => setConversationToDelete(activeConversation)}><Trash2 className="h-4 w-4" /> Excluir</AdminButton>
                  </div>
                ) : null}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {activeConversation.messages.map((message) => {
                  const isAteliux = message.from === "ateliux";
                  const isSystem = message.from === "sistema";
                  return (
                    <div key={message.id} className={`flex ${isSystem ? "justify-center" : isAteliux ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-3xl rounded-2xl p-4 ${isSystem ? "bg-gray-50 text-center" : isAteliux ? "bg-[#E6F7F1]" : "bg-gray-50"}`}>
                        <div className={`mb-2 flex items-center gap-3 ${isAteliux ? "justify-end" : "justify-between"}`}>
                          <span className="text-xs font-bold text-gray-700">{isSystem ? "Sistema" : isAteliux ? "Ateliux" : activeConversation.clientName}</span>
                          <span className="text-[10px] text-gray-400">{message.createdAt}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">{message.body}</p>
                        {message.attachments?.length ? (
                          <div className="mt-4 flex flex-wrap gap-3">
                            {message.attachments.map((attachment) => <AttachmentCard key={attachment.id} attachment={attachment} />)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                {pendingAttachment ? (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500">
                    <FileText className="h-4 w-4 text-[#00B074]" />
                    {pendingAttachment.name}
                    <button type="button" onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-red-500">remover</button>
                  </div>
                ) : null}
                <div className="relative">
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Escrever uma resposta..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 pr-32 text-sm outline-none focus:border-[#00B074]"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button type="button" onClick={attachMockFile} className="p-2 text-gray-400 hover:text-gray-600" aria-label="Anexar arquivo">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={sendReply} className="inline-flex items-center gap-2 rounded-lg bg-[#00B074] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#009662]">
                      <Send className="h-4 w-4" /> Enviar
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
              <Search className="mb-4 h-12 w-12 opacity-30" />
              <p>Nenhuma conversa selecionada.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(conversationToDelete)} onClose={() => setConversationToDelete(null)} title="Excluir conversa" description="Esta acao remove a conversa apenas do estado local da demonstracao.">
        {conversationToDelete ? (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">Confirma a exclusao da conversa <strong>{conversationToDelete.subject}</strong>?</p>
            <div className="flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={() => setConversationToDelete(null)}>Cancelar</AdminButton>
              <AdminButton variant="danger" onClick={deleteConversation}>Excluir</AdminButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
