"use client";

import Link from "next/link";
import { Edit3, ExternalLink, Grid2X2, List, MoreVertical, Plus, Search, Trash2, UserX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_CLIENTS } from "@/data/admin/admin-mock-data";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import type { AdminClient, ClientAccountStatus, ClientStatus } from "@/types/admin";
import { Badge } from "@/components/admin/ui/Badge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { LoadingState } from "@/components/admin/ui/LoadingState";
import { Modal } from "@/components/admin/ui/Modal";
import {
  createAdminClient,
  deleteAdminClient,
  inviteAdminClient,
  listAdminClients,
  updateAdminClient,
  updateAdminClientPipelineStatus,
  updateAdminClientStatus,
} from "@/services/admin-clients.service";

const columns: readonly { id: ClientStatus; title: string }[] = [
  { id: "novo", title: "Conta criada" },
  { id: "briefing", title: "Briefing" },
  { id: "design", title: "Design" },
  { id: "desenvolvimento", title: "Desenvolvimento" },
  { id: "aprovacao", title: "Aprovacao" },
  { id: "concluido", title: "Concluido" },
];

const statusLabel: Record<ClientStatus, string> = {
  novo: "Conta criada",
  briefing: "Briefing",
  design: "Design",
  desenvolvimento: "Desenvolvimento",
  aprovacao: "Aprovacao",
  concluido: "Concluido",
  inativo: "Inativo",
  lead: "Conta criada",
  homologacao: "Aprovacao",
  publicado: "Concluido",
};

const statusVariant: Record<ClientStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  novo: "blue",
  briefing: "yellow",
  design: "blue",
  desenvolvimento: "blue",
  aprovacao: "yellow",
  concluido: "green",
  inativo: "gray",
  lead: "blue",
  homologacao: "yellow",
  publicado: "green",
};

const emptyDraft: AdminClient = {
  id: 0,
  name: "",
  company: "",
  email: "",
  phone: "",
  project: "",
  plan: "Essencial",
  status: "novo",
  progress: 0,
  responsible: "Lina Armand",
  lastUpdate: "Conta criada no admin",
  lastAccess: "Nunca acessou",
  accountStatus: "Aguardando convite",
  projectId: "",
  notes: "",
};

const inputClassName = "rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20";

function createProjectForClientHref(clientId: AdminClient["id"]) {
  return `/portal-do-cliente/projetos?clientId=${encodeURIComponent(String(clientId))}&create=1`;
}

function ClientCard({
  client,
  onDetails,
  onEdit,
  onDeactivate,
  onDelete,
}: {
  client: AdminClient;
  onDetails: (client: AdminClient) => void;
  onEdit: (client: AdminClient) => void;
  onDeactivate: (client: AdminClient) => void;
  onDelete: (client: AdminClient) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <button type="button" onClick={() => onDetails(client)} className="w-full text-left">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h4 className="font-bold text-gray-900">{client.company}</h4>
            <p className="text-xs text-gray-500">{client.name}</p>
          </div>
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </div>
        <p className="mb-3 text-sm font-medium text-gray-700">{client.project}</p>
        <div className="mb-3 h-1.5 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-[#00B074]" style={{ width: `${client.progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{client.responsible}</span>
          <span>{client.progress}%</span>
        </div>
      </button>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => onEdit(client)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Editar cliente">
          <Edit3 className="h-4 w-4" />
        </button>
        <Link href={createProjectForClientHref(client.id)} data-testid="create-project-for-client-link" className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">
          Criar projeto para este cliente
        </Link>
        <Link href="/portal-do-cliente/projetos" className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Abrir portal">
          <ExternalLink className="h-4 w-4" />
        </Link>
        <button type="button" onClick={() => onDeactivate(client)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-red-500" aria-label="Inativar cliente">
          <UserX className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onDelete(client)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir cliente">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ClientsManagementView() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [mode, setMode] = useState<"kanban" | "lista">("kanban");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<AdminClient>(emptyDraft);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
  const [modal, setModal] = useState<"details" | "editor" | "delete" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await listAdminClients();
      setClients(items);
      setSource("api");
    } catch (requestError) {
      if (canUseDevFallback("admin/clients")) {
        setClients([...ADMIN_CLIENTS]);
        setSource("mock");
        setError("");
      } else {
        setClients([]);
        setSource("api");
        setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar clientes reais.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadClients();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => `${client.name} ${client.company} ${client.project} ${client.email}`.toLowerCase().includes(query.toLowerCase()));
  }, [clients, query]);

  function openCreate() {
    setSelectedClient(null);
    setDraft({ ...emptyDraft, id: Date.now() });
    setModal("editor");
  }

  function openEdit(client: AdminClient) {
    setSelectedClient(client);
    setDraft({ ...client });
    setModal("editor");
  }

  async function saveClient() {
    const normalizedDraft = {
      ...draft,
      progress: Math.min(100, Math.max(0, Number(draft.progress) || 0)),
      accountStatus: draft.accountStatus ?? "Ativa",
    };

    try {
      let saved = source === "api"
        ? selectedClient
          ? await updateAdminClient(selectedClient.id, normalizedDraft)
          : await createAdminClient(normalizedDraft)
        : normalizedDraft;

      if (source === "api" && selectedClient && normalizedDraft.accountStatus !== selectedClient.accountStatus) {
        const apiStatus = normalizedDraft.accountStatus === "Ativa" ? "ACTIVE" : normalizedDraft.accountStatus === "Inativa" ? "SUSPENDED" : "INVITED";
        saved = await updateAdminClientStatus(selectedClient.id, apiStatus);
      }

      setClients((current) => {
        const exists = current.some((client) => client.id === saved.id);
        return exists ? current.map((client) => (client.id === saved.id ? { ...client, ...saved } : client)) : [saved, ...current];
      });
      setSelectedClient(saved);
      setModal("details");
      setNotice(source === "api" ? "Dados principais do cliente salvos no backend." : "Cliente salvo apenas no fallback mockado.");
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel salvar cliente.");
    }
  }

  function updateClient(clientId: AdminClient["id"], patch: Partial<AdminClient>) {
    setClients((current) => current.map((client) => (client.id === clientId ? { ...client, ...patch } : client)));
    setSelectedClient((current) => (current?.id === clientId ? { ...current, ...patch } : current));
  }

  async function changePipelineStatus(client: AdminClient, status: ClientStatus) {
    try {
      const saved = source === "api"
        ? await updateAdminClientPipelineStatus(client.id, status)
        : { ...client, status, lastUpdate: `Status comercial alterado para ${statusLabel[status]}` };

      updateClient(client.id, saved);
      setNotice(source === "api" ? "Status comercial salvo no backend." : "Status comercial atualizado apenas no fallback mockado.");
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel atualizar status comercial.");
    }
  }

  async function deactivateClient(client: AdminClient) {
    try {
      const saved = source === "api" ? await updateAdminClientStatus(client.id, "SUSPENDED") : null;
      updateClient(client.id, {
        ...(saved ?? {}),
        accountStatus: "Inativa",
        lastUpdate: "Conta inativada pelo admin",
      });
      setNotice(source === "api" ? "Cliente inativado no backend." : "Cliente inativado apenas no fallback mockado.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel inativar cliente.");
    }
  }

  async function deleteClient() {
    if (!selectedClient) return;
    try {
      if (source === "api") await deleteAdminClient(selectedClient.id);
      setClients((current) => current.filter((client) => client.id !== selectedClient.id));
      setSelectedClient(null);
      setModal(null);
      setNotice(source === "api" ? "Cliente arquivado no backend." : "Cliente removido apenas no fallback mockado.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel arquivar cliente.");
    }
  }

  function selectForDelete(client: AdminClient) {
    setSelectedClient(client);
    setModal("delete");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Clientes com conta criada</h2>
          <p className="text-sm text-gray-500">Kanban e listagem dos clientes que acessam ou aguardam acesso ao Portal do Cliente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente..." className="w-64 rounded-xl border border-gray-100 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" />
          </div>
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            <button type="button" onClick={() => setMode("kanban")} className={`rounded-lg p-2 ${mode === "kanban" ? "bg-[#00B074] text-white" : "text-gray-400"}`} aria-label="Ver em kanban">
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setMode("lista")} className={`rounded-lg p-2 ${mode === "lista" ? "bg-[#00B074] text-white" : "text-gray-400"}`} aria-label="Ver em lista">
              <List className="h-4 w-4" />
            </button>
          </div>
          <AdminButton onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo cliente
          </AdminButton>
        </div>
      </div>

      {source === "mock" ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          API real indisponivel ou sem sessao admin. Exibindo fallback mockado de clientes.
        </div>
      ) : null}
      {notice ? <div className="rounded-2xl border border-[#A7F3D0] bg-[#E6F7F1] px-4 py-3 text-sm font-semibold text-[#00B074]">{notice}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div> : null}

      {loading ? <LoadingState title="Carregando clientes" /> : null}
      {!loading && error && !clients.length ? <ErrorState description={error} onRetry={loadClients} /> : null}
      {!loading && !error && !filteredClients.length ? <EmptyState title="Nenhum cliente encontrado." description="Crie ou ajuste a busca para visualizar clientes." /> : null}

      {!loading && (!error || clients.length) && filteredClients.length && mode === "kanban" ? (
        <div className="overflow-x-auto pb-3">
          <div className="grid min-w-[1200px] grid-cols-6 gap-4">
            {columns.map((column) => {
              const columnClients = filteredClients.filter((client) => client.status === column.id || (column.id === "aprovacao" && client.status === "homologacao") || (column.id === "concluido" && client.status === "publicado") || (column.id === "novo" && client.status === "lead"));
              return (
                <section key={column.id} className="rounded-3xl border border-gray-100 bg-white/60 p-3">
                  <div className="mb-4 flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-gray-800">{column.title}</h3>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-400">{columnClients.length}</span>
                  </div>
                  <div className="space-y-3">
                    {columnClients.map((client) => (
                      <ClientCard key={client.id} client={client} onDetails={(item) => { setSelectedClient(item); setModal("details"); }} onEdit={openEdit} onDeactivate={deactivateClient} onDelete={selectForDelete} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : null}

      {!loading && (!error || clients.length) && filteredClients.length && mode === "lista" ? (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="rounded-l-xl p-4">Cliente</th>
                  <th className="p-4">Projeto</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Conta</th>
                  <th className="p-4">Progresso</th>
                  <th className="rounded-r-xl p-4 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{client.company}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{client.project}</td>
                    <td className="p-4">
                      <Badge variant="gray">{client.plan}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusVariant[client.status]}>{statusLabel[client.status]}</Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{client.accountStatus}</td>
                    <td className="p-4 text-sm font-bold text-[#00B074]">{client.progress}%</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setSelectedClient(client); setModal("details"); }} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">
                          Detalhes
                        </button>
                        <button type="button" onClick={() => openEdit(client)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Editar">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => selectForDelete(client)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Modal isOpen={modal === "details" && Boolean(selectedClient)} onClose={() => setModal(null)} title="Detalhes do cliente" description="Resumo da conta e do projeto real no Portal do Cliente." size="lg">
        {selectedClient ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Empresa</p><p className="font-bold text-gray-900">{selectedClient.company}</p></div>
              <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Contato</p><p className="font-bold text-gray-900">{selectedClient.name}</p></div>
              <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Projeto</p><p className="font-bold text-gray-900">{selectedClient.project}</p></div>
              <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Ultima atualizacao</p><p className="font-bold text-gray-900">{selectedClient.lastUpdate}</p></div>
              <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Ultimo acesso</p><p className="font-bold text-gray-900">{selectedClient.lastAccess}</p></div>
              <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Projeto real</p><p className="font-bold text-gray-900">{selectedClient.projectId || "Sem projeto"}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Status comercial
                <select value={selectedClient.status} onChange={(event) => { void changePipelineStatus(selectedClient, event.target.value as ClientStatus); }} className={inputClassName}>
                  {columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
                  <option value="inativo">Inativo</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-700">
                Status da conta
                <select value={selectedClient.accountStatus ?? "Ativa"} onChange={async (event) => { const accountStatus = event.target.value as ClientAccountStatus; const apiStatus = accountStatus === "Ativa" ? "ACTIVE" : accountStatus === "Inativa" ? "SUSPENDED" : "INVITED"; try { const saved = source === "api" ? await updateAdminClientStatus(selectedClient.id, apiStatus) : null; updateClient(selectedClient.id, { ...(saved ?? {}), accountStatus }); setNotice(source === "api" ? "Status da conta atualizado no backend." : "Status da conta atualizado apenas no fallback mockado."); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Nao foi possivel atualizar status da conta."); } }} className={inputClassName}>
                  <option>Ativa</option>
                  <option>Aguardando convite</option>
                  <option>Inativa</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Link href={createProjectForClientHref(selectedClient.id)} data-testid="create-project-for-client-link" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                <Plus className="h-4 w-4" /> Criar projeto para este cliente
              </Link>
              <AdminButton variant="secondary" onClick={async () => { try { if (source === "api") await inviteAdminClient(selectedClient.id); updateClient(selectedClient.id, { accountStatus: "Aguardando convite" }); setNotice(source === "api" ? "Convite enviado pelo backend." : "Convite simulado no fallback mockado."); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Nao foi possivel enviar convite."); } }}>Enviar convite</AdminButton>
              <Link href="/portal-do-cliente/projetos" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                <ExternalLink className="h-4 w-4" /> Ver portal
              </Link>
              <AdminButton variant="secondary" onClick={() => deactivateClient(selectedClient)}>Inativar conta</AdminButton>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal isOpen={modal === "editor"} onClose={() => setModal(null)} title={selectedClient ? "Editar cliente" : "Novo cliente"} description={source === "api" ? "Os dados principais serao salvos no backend." : "API indisponivel: dados salvos apenas no fallback mockado."} size="lg">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Empresa<input value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Contato<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">E-mail<input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Telefone<input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Projeto<input value={draft.project} onChange={(event) => setDraft((current) => ({ ...current, project: event.target.value }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Responsavel<input value={draft.responsible} onChange={(event) => setDraft((current) => ({ ...current, responsible: event.target.value }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Plano<select value={draft.plan} onChange={(event) => setDraft((current) => ({ ...current, plan: event.target.value as AdminClient["plan"] }))} className={inputClassName}><option>Essencial</option><option>Profissional</option><option>Enterprise</option></select></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Status<select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ClientStatus }))} className={inputClassName}>{columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}<option value="inativo">Inativo</option></select></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Progresso<input type="number" min={0} max={100} value={draft.progress} onChange={(event) => setDraft((current) => ({ ...current, progress: Number(event.target.value) }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Conta<select value={draft.accountStatus ?? "Ativa"} onChange={(event) => setDraft((current) => ({ ...current, accountStatus: event.target.value as ClientAccountStatus }))} className={inputClassName}><option>Ativa</option><option>Aguardando convite</option><option>Inativa</option></select></label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-gray-700">Notas<textarea value={draft.notes ?? ""} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} rows={3} className={`${inputClassName} resize-none`} /></label>
          <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setModal(null)}>Cancelar</AdminButton><AdminButton onClick={saveClient}>Salvar cliente</AdminButton></div>
        </div>
      </Modal>

      <Modal isOpen={modal === "delete" && Boolean(selectedClient)} onClose={() => setModal(null)} title="Arquivar cliente" description={source === "api" ? "Esta acao arquiva o cliente no backend." : "Esta acao remove o cliente apenas do fallback mockado."}>
        {selectedClient ? (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">Confirma o arquivamento de <strong>{selectedClient.company}</strong>? O registro sai da lista e do kanban imediatamente.</p>
            <div className="flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={() => setModal(null)}>Cancelar</AdminButton>
              <AdminButton variant="danger" onClick={deleteClient}>Excluir</AdminButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
