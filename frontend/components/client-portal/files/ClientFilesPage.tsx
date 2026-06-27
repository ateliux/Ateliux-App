"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Download, Eye, FilePlus2, Upload } from "lucide-react";
import type { ClientFile } from "@/types/client-portal";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { ClientPortalToast } from "@/components/client-portal/ui/ClientPortalToast";
import {
  getClientFileSignedUrl,
  listClientFiles,
  uploadClientFile,
} from "@/services/client-files.service";
import { listClientProjects } from "@/services/client-projects.service";

type ProjectOption = {
  id: string;
  name: string;
};

const statusLabel: Record<ClientFile["status"], string> = {
  available: "Disponivel",
  approved: "Aprovado",
  processing: "Processando",
  pending_review: "Aguardando revisao",
  rejected: "Rejeitado",
  deleted: "Deletado",
};

const statusVariant: Record<ClientFile["status"], "neutral" | "success" | "warning" | "danger" | "info"> = {
  available: "success",
  approved: "success",
  processing: "info",
  pending_review: "warning",
  rejected: "danger",
  deleted: "neutral",
};

export function ClientFilesPage() {
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [origin, setOrigin] = useState<"all" | ClientFile["origin"]>("all");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewing, setViewing] = useState<ClientFile | null>(null);
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [filesResult, projectItems] = await Promise.all([
        listClientFiles(),
        listClientProjects<ProjectOption>().catch(() => []),
      ]);
      setFiles(filesResult.files);
      setSource(filesResult.source);
      setProjects(projectItems);
    } catch (requestError) {
      setFiles([]);
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar arquivos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) return;

    const form = new FormData(event.currentTarget);
    const projectId = String(form.get("projectId") ?? "");

    setUploading(true);
    try {
      const uploaded = await uploadClientFile(selectedFile, projectId || undefined);
      setFiles((current) => [uploaded, ...current]);
      setUploadOpen(false);
      setSelectedFile(null);
      setSource("api");
      notify(
        uploaded.status === "pending_review"
          ? "Arquivo enviado. Ele ficou aguardando revisao da equipe Ateliux."
          : "Arquivo enviado com sucesso.",
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : "Nao foi possivel enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  async function download(file: ClientFile) {
    if (file.status === "pending_review") {
      notify("Este arquivo ainda esta aguardando revisao e nao pode ser baixado.");
      return;
    }

    if (file.status === "rejected" || file.status === "deleted") {
      notify("Este arquivo nao esta disponivel para download.");
      return;
    }

    if (!file.fileAssetId || source === "mock") {
      notify(`Download disponivel apenas quando a API real retornar signed URL para ${file.name}.`);
      return;
    }

    try {
      const { url } = await getClientFileSignedUrl(file.fileAssetId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Nao foi possivel gerar signed URL.");
    }
  }

  const types = useMemo(() => Array.from(new Set(files.map((file) => file.type))), [files]);
  const visible = files.filter((file) => (origin === "all" || file.origin === origin) && (type === "all" || file.type === type));

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <ClientPortalPageHeader
        eyebrow="Central de materiais"
        title="Arquivos"
        description="Encontre materiais enviados por voce e entregas disponibilizadas pela Ateliux."
        actions={<ClientPortalButton onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" />Enviar arquivo</ClientPortalButton>}
      />

      <p className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        Arquivos enviados podem passar por revisao da equipe Ateliux antes de ficarem disponiveis.
      </p>

      {source === "mock" ? (
        <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Usando fallback de desenvolvimento porque a API nao respondeu.
        </p>
      ) : null}

      {loading ? <LoadingState title="Carregando arquivos" /> : null}
      {!loading && error ? <ErrorState description={error} onRetry={loadData} /> : null}

      {!loading && !error ? <div className="mb-6 flex flex-wrap gap-3">
        <select value={origin} onChange={(event) => setOrigin(event.target.value as typeof origin)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
          <option value="all">Todas as origens</option>
          <option>Cliente</option>
          <option>Ateliux</option>
        </select>
        <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
          <option value="all">Todos os tipos</option>
          {types.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div> : null}

      {!loading && !error && !visible.length ? <EmptyState title="Nenhum arquivo encontrado." description="Arquivos enviados e entregas aprovadas aparecerao aqui." /> : null}

      {!loading && !error && visible.length ? <ClientPortalCard className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4">Arquivo</th>
              <th className="p-4">Origem</th>
              <th className="p-4">Data</th>
              <th className="p-4">Tamanho</th>
              <th className="p-4">Status</th>
              <th className="p-4">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((file) => (
              <tr key={file.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><FilePlus2 className="h-4 w-4" /></span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-400">{file.type}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4"><ClientPortalBadge variant={file.origin === "Ateliux" ? "info" : "neutral"}>{file.origin}</ClientPortalBadge></td>
                <td className="p-4 text-sm text-slate-500">{file.date}</td>
                <td className="p-4 text-sm text-slate-500">{file.size}</td>
                <td className="p-4"><ClientPortalBadge variant={statusVariant[file.status]}>{statusLabel[file.status]}</ClientPortalBadge></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewing(file)} aria-label={`Visualizar ${file.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye className="h-4 w-4" /></button>
                    <button type="button" onClick={() => download(file)} aria-label={`Baixar ${file.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Download className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ClientPortalCard> : null}

      {uploadOpen ? (
        <ClientPortalModal title="Enviar novo arquivo" description="O arquivo sera enviado para o backend seguro de uploads." onClose={() => setUploadOpen(false)}>
          <form onSubmit={upload} className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Escolha um arquivo
              <input type="file" required onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700" />
            </label>
            {selectedFile ? <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{selectedFile.name} - {Math.max(1, Math.round(selectedFile.size / 1024))} KB</p> : null}
            <label className="block text-sm font-medium text-slate-700">
              Projeto opcional
              <select name="projectId" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <option value="">Sem vinculo de projeto</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-3">
              <ClientPortalButton variant="secondary" onClick={() => setUploadOpen(false)}>Cancelar</ClientPortalButton>
              <ClientPortalButton type="submit" disabled={uploading}>{uploading ? "Enviando..." : "Enviar arquivo"}</ClientPortalButton>
            </div>
          </form>
        </ClientPortalModal>
      ) : null}

      {viewing ? (
        <ClientPortalModal title={viewing.name} description={`${viewing.type} - ${viewing.size} - enviado por ${viewing.origin}`} onClose={() => setViewing(null)} size="lg">
          <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
            <div>
              <Eye className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-semibold text-slate-700">{statusLabel[viewing.status]}</p>
              <p className="mt-1 text-xs text-slate-400">{viewing.rejectionReason ?? "Acesso ao arquivo real usa signed URL quando aprovado."}</p>
            </div>
          </div>
        </ClientPortalModal>
      ) : null}

      {toast ? <ClientPortalToast message={toast} /> : null}
    </div>
  );
}
