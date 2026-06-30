"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  FileSearch,
  Filter,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { LoadingState } from "@/components/admin/ui/LoadingState";
import { MetricCard } from "@/components/admin/ui/MetricCard";
import { Modal } from "@/components/admin/ui/Modal";
import {
  approveAdminFile,
  deleteAdminFile,
  getSignedFileUrl,
  listAdminFiles,
  rejectAdminFile,
  type AdminFileAsset,
  type AdminFileContext,
  type AdminFileOrigin,
  type AdminFileStatus,
} from "@/services/admin-files.service";
import type { BadgeVariant } from "@/types/admin";

const statusLabels: Record<AdminFileStatus, string> = {
  PENDING_REVIEW: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  DELETED: "Deletado",
};

const statusVariant: Record<AdminFileStatus, BadgeVariant> = {
  PENDING_REVIEW: "yellow",
  APPROVED: "green",
  REJECTED: "red",
  DELETED: "gray",
};

const contextLabels: Record<AdminFileContext, string> = {
  AVATAR: "Avatar",
  BLOG_COVER: "Blog",
  BLOG_HERO: "Blog hero",
  CONTACT_ATTACHMENT: "Contato",
  SUPPORT_ATTACHMENT: "Suporte",
  CLIENT_FILE: "Arquivo do cliente",
  APPROVAL_ATTACHMENT: "Aprovacao",
  BRIEFING_ATTACHMENT: "Briefing",
  FINANCE_RECEIPT: "Financeiro",
  PREVIEW_ASSET: "Preview",
};

const riskLabels: Record<AdminFileAsset["riskLevel"], string> = {
  SAFE_PREVIEW: "Visualizacao segura",
  DOWNLOAD_ONLY: "Download",
  HIGH_RISK_DOWNLOAD_ONLY: "Download protegido",
};

const downloadModeLabels: Record<AdminFileAsset["downloadMode"], string> = {
  INLINE_ALLOWED: "Preview permitido",
  ATTACHMENT_ONLY: "Apenas anexo",
};

function riskVariant(riskLevel: AdminFileAsset["riskLevel"]) {
  if (riskLevel === "HIGH_RISK_DOWNLOAD_ONLY") return "yellow";
  if (riskLevel === "SAFE_PREVIEW") return "green";
  return "gray";
}

const originLabels: Record<AdminFileOrigin, string> = {
  CLIENT: "Cliente",
  ATELIUX: "Admin",
  PUBLIC: "Publico",
  SYSTEM: "Sistema",
};

function formatBytes(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function clientLabel(file: AdminFileAsset) {
  return file.client?.company ?? file.client?.name ?? file.clientId ?? "Sem cliente";
}

function projectLabel(file: AdminFileAsset) {
  return file.project?.name ?? file.projectId ?? "Sem projeto";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function FileReviewView() {
  const [files, setFiles] = useState<AdminFileAsset[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"ALL" | AdminFileStatus>("ALL");
  const [client, setClient] = useState("ALL");
  const [project, setProject] = useState("ALL");
  const [context, setContext] = useState<"ALL" | AdminFileContext>("ALL");
  const [origin, setOrigin] = useState<"ALL" | AdminFileOrigin>("ALL");
  const [query, setQuery] = useState("");
  const [details, setDetails] = useState<AdminFileAsset | null>(null);
  const [rejecting, setRejecting] = useState<AdminFileAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFileAsset | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listAdminFiles();
      setFiles(result.files);
      setSource(result.source);
    } catch (requestError) {
      setFiles([]);
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar arquivos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFiles();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadFiles]);

  const clients = useMemo(() => Array.from(new Set(files.map(clientLabel))).sort(), [files]);
  const projects = useMemo(() => Array.from(new Set(files.map(projectLabel))).sort(), [files]);

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return files.filter((file) => {
      const matchesStatus = status === "ALL" || file.status === status;
      const matchesClient = client === "ALL" || clientLabel(file) === client;
      const matchesProject = project === "ALL" || projectLabel(file) === project;
      const matchesContext = context === "ALL" || file.context === context;
      const matchesOrigin = origin === "ALL" || file.origin === origin;
      const matchesQuery =
        !normalizedQuery ||
        file.originalName.toLowerCase().includes(normalizedQuery) ||
        file.safeName.toLowerCase().includes(normalizedQuery) ||
        file.id.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesClient && matchesProject && matchesContext && matchesOrigin && matchesQuery;
    });
  }, [client, context, files, origin, project, query, status]);

  const stats = useMemo(() => {
    const pending = files.filter((file) => file.status === "PENDING_REVIEW").length;
    const approved = files.filter((file) => file.status === "APPROVED").length;
    const rejected = files.filter((file) => file.status === "REJECTED").length;
    const today = files.filter((file) => file.createdAt.slice(0, 10) === todayIso()).length;
    return {
      pending,
      approved,
      rejected,
      today,
      clients: clients.length,
      contexts: new Set(files.map((file) => file.context)).size,
    };
  }, [clients.length, files]);

  async function approve(file: AdminFileAsset) {
    if (source === "mock") {
      setFiles((current) => current.map((item) => (item.id === file.id ? { ...item, status: "APPROVED", rejectionReason: null } : item)));
      setNotice("Arquivo aprovado somente no fallback mockado.");
      return;
    }

    const updated = await approveAdminFile(file.id);
    setFiles((current) => current.map((item) => (item.id === file.id ? updated : item)));
    setNotice("Arquivo aprovado com sucesso.");
  }

  async function reject() {
    if (!rejecting) return;
    if (rejectReason.trim().length < 3) {
      setError("Informe um motivo de rejeicao com pelo menos 3 caracteres.");
      return;
    }

    if (source === "mock") {
      setFiles((current) =>
        current.map((item) =>
          item.id === rejecting.id ? { ...item, status: "REJECTED", rejectionReason: rejectReason } : item,
        ),
      );
      setNotice("Arquivo rejeitado somente no fallback mockado.");
    } else {
      const updated = await rejectAdminFile(rejecting.id, rejectReason);
      setFiles((current) => current.map((item) => (item.id === rejecting.id ? updated : item)));
      setNotice("Arquivo rejeitado com sucesso.");
    }

    setRejecting(null);
    setRejectReason("");
    setError("");
  }

  async function openSignedUrl(file: AdminFileAsset) {
    if (source === "mock") {
      setNotice("Signed URL simulada no fallback mockado.");
      return;
    }

    const { url } = await getSignedFileUrl(file.id);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function deleteFile() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");
    try {
      const deletedFile = source !== "mock" ? await deleteAdminFile(deleteTarget.id) : null;
      setFiles((current) =>
        current.map((item) =>
          item.id === deleteTarget.id
            ? {
                ...item,
                ...(deletedFile ?? {}),
                status: "DELETED",
                deletedAt: deletedFile?.deletedAt ?? new Date().toISOString(),
              }
            : item,
        ),
      );
      setNotice(source === "mock" ? "Arquivo excluido somente no fallback mockado." : "Arquivo removido da Ateliux e do Cloudinary.");
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Nao foi possivel excluir o arquivo no Cloudinary.");
    } finally {
      setDeleting(false);
    }
  }

  async function copyId(file: AdminFileAsset) {
    await navigator.clipboard.writeText(file.id);
    setNotice("ID copiado.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#00B074]">Seguranca de uploads</p>
        <h1 className="text-2xl font-bold text-gray-900">Revisao de Arquivos</h1>
        <p className="max-w-3xl text-sm text-gray-500">
          Arquivos enviados por clientes aguardando analise da equipe Ateliux.
        </p>
      </div>

      {source === "mock" ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Usando fallback de desenvolvimento porque a API nao respondeu.
        </div>
      ) : null}
      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-[#00B074]">{notice}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard title="Pendentes" value={stats.pending} icon={<FileSearch className="h-5 w-5" />} />
        <MetricCard title="Aprovados" value={stats.approved} icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard title="Rejeitados" value={stats.rejected} icon={<XCircle className="h-5 w-5" />} />
        <MetricCard title="Enviados hoje" value={stats.today} icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard title="Por cliente" value={stats.clients} icon={<Filter className="h-5 w-5" />} />
        <MetricCard title="Por contexto" value={stats.contexts} icon={<FileSearch className="h-5 w-5" />} />
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou ID" className="rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20 xl:col-span-2" />
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm"><option value="ALL">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={client} onChange={(event) => setClient(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm"><option value="ALL">Todos os clientes</option>{clients.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={project} onChange={(event) => setProject(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm"><option value="ALL">Todos os projetos</option>{projects.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={context} onChange={(event) => setContext(event.target.value as typeof context)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm"><option value="ALL">Todos os contextos</option>{Object.entries(contextLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={origin} onChange={(event) => setOrigin(event.target.value as typeof origin)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm"><option value="ALL">Todas as origens</option>{Object.entries(originLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        {loading ? <LoadingState title="Carregando arquivos" /> : null}
        {!loading && error && !files.length ? <ErrorState description={error} onRetry={loadFiles} /> : null}
        {!loading && !error && filteredFiles.length === 0 ? <EmptyState title="Nenhum arquivo encontrado." description="Arquivos enviados para revisao aparecerao aqui." /> : null}
        {!loading && filteredFiles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="rounded-l-xl p-4">Arquivo</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Projeto</th>
                  <th className="p-4">Contexto</th>
                  <th className="p-4">Origem</th>
                  <th className="p-4">MIME</th>
                  <th className="p-4">Risco</th>
                  <th className="p-4">Tamanho</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Envio</th>
                  <th className="rounded-r-xl p-4 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="p-4"><p className="font-bold text-gray-900">{file.originalName}</p><p className="text-xs text-gray-400">{file.safeName}</p></td>
                    <td className="p-4 text-sm text-gray-600">{clientLabel(file)}</td>
                    <td className="p-4 text-sm text-gray-600">{projectLabel(file)}</td>
                    <td className="p-4 text-sm text-gray-600">{contextLabels[file.context]}</td>
                    <td className="p-4 text-sm text-gray-600">{originLabels[file.origin]}</td>
                    <td className="p-4 text-xs text-gray-500">{file.mimeType}<br />{file.detectedMime ?? "Nao detectado"}</td>
                    <td className="p-4"><Badge variant={riskVariant(file.riskLevel)}>{riskLabels[file.riskLevel]}</Badge></td>
                    <td className="p-4 text-sm text-gray-500">{formatBytes(file.size)}</td>
                    <td className="p-4"><Badge variant={statusVariant[file.status]}>{statusLabels[file.status]}</Badge></td>
                    <td className="p-4 text-sm text-gray-500">{new Date(file.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setDetails(file)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Visualizar detalhes"><Eye className="h-4 w-4" /></button>
                        <button type="button" onClick={() => copyId(file)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Copiar ID"><Clipboard className="h-4 w-4" /></button>
                        <button type="button" onClick={() => openSignedUrl(file)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Obter signed URL"><Download className="h-4 w-4" /></button>
                        {file.status === "PENDING_REVIEW" ? <AdminButton onClick={() => approve(file)}>Aprovar</AdminButton> : null}
                        {file.status !== "REJECTED" && file.status !== "DELETED" ? <AdminButton variant="danger" onClick={() => { setRejecting(file); setRejectReason(""); }}>Rejeitar</AdminButton> : null}
                        {file.status !== "PENDING_REVIEW" && file.status !== "DELETED" ? <button type="button" onClick={() => setDeleteTarget(file)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <Modal isOpen={Boolean(details)} onClose={() => setDetails(null)} title="Detalhes do arquivo" size="lg">
        {details ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["ID", details.id],
              ["Nome original", details.originalName],
              ["Nome seguro", details.safeName],
              ["Cliente", clientLabel(details)],
              ["Projeto", projectLabel(details)],
              ["Contexto", contextLabels[details.context]],
              ["Origem", originLabels[details.origin]],
              ["MIME informado", details.mimeType],
              ["MIME detectado", details.detectedMime ?? "Nao detectado"],
              ["Risco", riskLabels[details.riskLevel]],
              ["Modo de download", downloadModeLabels[details.downloadMode]],
              ["Extensao", details.extension],
              ["Tamanho", formatBytes(details.size)],
              ["Status", statusLabels[details.status]],
              ["Scan", details.scanStatus ?? "NOT_SCANNED"],
              ["Cloudinary public id", details.cloudinaryPublicId ?? "Nao informado"],
              ["Cloudinary resource type", details.cloudinaryResourceType ?? "Inferido pelo backend"],
              ["Enviado por", details.uploadedBy?.name ?? details.uploadedByType ?? "Nao informado"],
              ["Motivo de rejeicao", details.rejectionReason ?? "-"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-gray-100 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Historico</p>
              <p className="mt-2 text-sm text-gray-500">Eventos relacionados ficam registrados no AuditLog do backend.</p>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal isOpen={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Rejeitar arquivo" description="Informe o motivo da rejeicao. O cliente sera notificado pelo backend.">
        <div className="space-y-4">
          <label className="grid gap-2 text-sm font-semibold text-gray-700">
            Motivo da rejeicao
            <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={5} placeholder="Tipo de arquivo nao permitido, conteudo suspeito, documento incompleto..." className="resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" />
          </label>
          <div className="flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setRejecting(null)}>Cancelar</AdminButton>
            <AdminButton variant="danger" onClick={reject}>Confirmar rejeicao</AdminButton>
          </div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Confirmar exclusao" description="Este arquivo sera removido da Ateliux e tambem do armazenamento Cloudinary. Essa acao nao libera o arquivo para o cliente e nao podera ser desfeita.">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Confirma a exclusao de <strong>{deleteTarget?.originalName}</strong>? Se o Cloudinary falhar, o arquivo continuara ativo para nova tentativa.
          </p>
          <div className="flex justify-end gap-3">
            <AdminButton variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</AdminButton>
            <AdminButton variant="danger" onClick={deleteFile} disabled={deleting}>{deleting ? "Excluindo..." : "Excluir arquivo"}</AdminButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
