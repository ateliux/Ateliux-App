"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Eye, Pencil, Plus, XCircle } from "lucide-react";
import { clientRequests as initialRequests } from "@/data/client-portal/client-portal-mock-data";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import type { ClientPriority, ClientRequest, ClientRequestStatus } from "@/types/client-portal";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalInput, ClientPortalSelect, ClientPortalTextarea } from "@/components/client-portal/ui/ClientPortalFields";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { ClientPortalToast } from "@/components/client-portal/ui/ClientPortalToast";
import { requestStatusLabel, statusVariant } from "@/components/client-portal/ui/client-portal-status";
import { uploadClientRequestAttachment } from "@/services/client-files.service";
import { createClientRequest, listClientRequests } from "@/services/client-requests.service";

type RequestModal = { mode: "details" | "edit"; request: ClientRequest } | { mode: "create"; request?: never };

const categoryLabels: Record<ClientRequest["category"], string> = { design: "Design", text: "Texto", feature: "Funcionalidade", image: "Imagem", deadline: "Prazo", other: "Outro" };
const priorityLabels: Record<ClientPriority, string> = { low: "Baixa", medium: "Media", high: "Alta" };

export function ClientRequestsPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [filter, setFilter] = useState<"all" | ClientRequestStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<RequestModal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const visible = filter === "all" ? requests : requests.filter((item) => item.status === filter);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await listClientRequests();
      setRequests(items);
      setSource("api");
    } catch (requestError) {
      if (canUseDevFallback("frontend/client-requests")) {
        setRequests(initialRequests);
        setSource("mock");
      } else {
        setRequests([]);
        setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar solicitacoes.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadRequests]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const attachment = form.get("attachment");
    let attachmentName = modal?.mode === "edit" ? modal.request.attachmentName : undefined;
    let attachmentFileAssetId = modal?.mode === "edit" ? modal.request.attachmentFileAssetId : undefined;
    let attachmentStatus = modal?.mode === "edit" ? modal.request.attachmentStatus : undefined;

    setSubmitting(true);
    try {
      if (attachment instanceof File && attachment.name) {
        const uploaded = await uploadClientRequestAttachment(attachment);
        attachmentName = uploaded.name;
        attachmentFileAssetId = uploaded.fileAssetId;
        attachmentStatus = uploaded.status;
      }

      const next: ClientRequest = modal?.mode === "edit"
        ? {
            id: modal.request.id,
            title: String(form.get("title")),
            category: String(form.get("category")) as ClientRequest["category"],
            description: String(form.get("description")),
            priority: String(form.get("priority")) as ClientPriority,
            status: modal.request.status,
            createdAt: modal.request.createdAt,
            response: modal.request.response,
            attachmentName,
            attachmentFileAssetId,
            attachmentStatus,
          }
        : await createClientRequest({
            title: String(form.get("title")),
            category: String(form.get("category")) as ClientRequest["category"],
            description: String(form.get("description")),
            priority: String(form.get("priority")) as ClientPriority,
            fileAssetIds: attachmentFileAssetId ? [attachmentFileAssetId] : undefined,
          });

      setRequests((current) => modal?.mode === "edit" ? current.map((item) => item.id === next.id ? next : item) : [next, ...current]);
      if (modal?.mode === "create") setSource("api");
      notify(modal?.mode === "edit" ? "Solicitacao atualizada." : "Nova solicitacao enviada.");
      setModal(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Nao foi possivel salvar a solicitacao.");
    } finally {
      setSubmitting(false);
    }
  }

  function cancel(request: ClientRequest) {
    setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: "cancelled" } : item));
    notify("Solicitacao cancelada.");
    setModal(null);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <ClientPortalPageHeader
        eyebrow="Comunicacao de escopo"
        title="Solicitacoes"
        description="Envie ideias, ajustes e materiais sem perder o historico do projeto."
        actions={<ClientPortalButton onClick={() => setModal({ mode: "create" })}><Plus className="h-4 w-4" />Nova solicitacao</ClientPortalButton>}
      />

      {source === "mock" ? (
        <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Usando fallback de desenvolvimento porque a API nao respondeu.
        </p>
      ) : null}

      {loading ? <LoadingState title="Carregando solicitacoes" /> : null}
      {!loading && error ? <ErrorState description={error} onRetry={loadRequests} /> : null}

      {!loading && !error ? <div className="mb-6 flex flex-wrap gap-2">
        {([
          { label: "Todas", value: "all" },
          { label: "Abertas", value: "open" },
          { label: "Em analise", value: "in_review" },
          { label: "Respondidas", value: "answered" },
          { label: "Canceladas", value: "cancelled" },
        ] as const).map((item) => (
          <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-xl px-4 py-2 text-xs font-semibold ${filter === item.value ? "bg-black text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
            {item.label}
          </button>
        ))}
      </div> : null}

      {!loading && !error && !visible.length ? <EmptyState title="Nenhuma solicitacao encontrada." description="Crie uma nova solicitacao para iniciar o historico." /> : null}

      {!loading && !error && visible.length ? <div className="space-y-4">
        {visible.map((request) => (
          <ClientPortalCard key={request.id} className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <ClientPortalBadge variant={statusVariant(request.status)}>{requestStatusLabel[request.status]}</ClientPortalBadge>
                  <ClientPortalBadge>{priorityLabels[request.priority]}</ClientPortalBadge>
                </div>
                <h2 className="mt-3 font-bold text-slate-900">{request.title}</h2>
                <p className="mt-1 text-xs text-slate-400">{categoryLabels[request.category]} - {request.createdAt}</p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{request.description}</p>
                {request.response ? <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong>Resposta da Ateliux:</strong> {request.response}</div> : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <ClientPortalButton variant="secondary" onClick={() => setModal({ mode: "details", request })}><Eye className="h-4 w-4" />Detalhes</ClientPortalButton>
                {request.status === "open" ? <ClientPortalButton variant="ghost" onClick={() => setModal({ mode: "edit", request })}><Pencil className="h-4 w-4" />Editar</ClientPortalButton> : null}
              </div>
            </div>
          </ClientPortalCard>
        ))}
      </div> : null}

      {modal?.mode === "create" || modal?.mode === "edit" ? (
        <ClientPortalModal title={modal.mode === "create" ? "Nova solicitacao" : "Editar solicitacao"} description="Anexos passam pelo upload seguro antes da solicitacao ser salva." onClose={() => setModal(null)} size="lg">
          <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <ClientPortalInput name="title" label="Titulo" defaultValue={modal.mode === "edit" ? modal.request.title : ""} required />
            <ClientPortalSelect name="category" label="Categoria" defaultValue={modal.mode === "edit" ? modal.request.category : "design"}>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</ClientPortalSelect>
            <ClientPortalSelect name="priority" label="Prioridade" defaultValue={modal.mode === "edit" ? modal.request.priority : "medium"}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</ClientPortalSelect>
            <ClientPortalInput name="attachment" label="Anexo opcional" type="file" />
            <div className="sm:col-span-2"><ClientPortalTextarea name="description" label="Descricao" rows={5} defaultValue={modal.mode === "edit" ? modal.request.description : ""} required /></div>
            <div className="flex justify-end gap-3 sm:col-span-2"><ClientPortalButton variant="secondary" onClick={() => setModal(null)}>Cancelar</ClientPortalButton><ClientPortalButton type="submit" disabled={submitting}>{submitting ? "Enviando..." : "Salvar solicitacao"}</ClientPortalButton></div>
          </form>
        </ClientPortalModal>
      ) : null}

      {modal?.mode === "details" ? (
        <ClientPortalModal title={modal.request.title} description={`${categoryLabels[modal.request.category]} - ${modal.request.createdAt}`} onClose={() => setModal(null)}>
          <p className="text-sm leading-6 text-slate-600">{modal.request.description}</p>
          {modal.request.attachmentName ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">Anexo: {modal.request.attachmentName}</p> : null}
          {modal.request.response ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong>Resposta:</strong> {modal.request.response}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            {modal.request.status === "open" ? (
              <>
                <ClientPortalButton variant="danger" onClick={() => cancel(modal.request)}><XCircle className="h-4 w-4" />Cancelar solicitacao</ClientPortalButton>
                <ClientPortalButton onClick={() => setModal({ mode: "edit", request: modal.request })}>Editar</ClientPortalButton>
              </>
            ) : null}
          </div>
        </ClientPortalModal>
      ) : null}

      {toast ? <ClientPortalToast message={toast} /> : null}
    </div>
  );
}
