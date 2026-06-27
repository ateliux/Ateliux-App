"use client";

import { Archive, Copy, Edit3, Eye, Plus, Search, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_BLOG_POSTS } from "@/data/admin/admin-mock-data";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import {
  archiveAdminBlogPost,
  createAdminBlogPost,
  deleteAdminBlogPost,
  listAdminBlogPosts,
  publishAdminBlogPost,
  unpublishAdminBlogPost,
  updateAdminBlogPost,
  type AdminBlogPostDto,
  type AdminBlogPostStatusDto,
} from "@/services/admin-blog.service";
import type { AdminBlogPost, BlogPostStatus } from "@/types/admin";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { LoadingState } from "@/components/admin/ui/LoadingState";
import { Modal } from "@/components/admin/ui/Modal";

type DraftPost = Omit<AdminBlogPost, "id" | "apiId">;

const emptyDraft: DraftPost = {
  title: "",
  slug: "",
  tag: "Produto",
  author: "Equipe Ateliux",
  status: "Rascunho",
  date: "Hoje",
  readTime: "5 min",
  description: "",
  content: "",
};

const statuses: readonly BlogPostStatus[] = ["Publicado", "Rascunho", "Agendado", "Arquivado"];

const statusVariant: Record<BlogPostStatus, "green" | "yellow" | "blue" | "gray"> = {
  Publicado: "green",
  Rascunho: "yellow",
  Agendado: "blue",
  Arquivado: "gray",
};

const inputClassName = "rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sem data" : new Intl.DateTimeFormat("pt-BR").format(date);
}

function mapStatus(status: AdminBlogPostStatusDto): BlogPostStatus {
  if (status === "PUBLISHED") return "Publicado";
  if (status === "SCHEDULED") return "Agendado";
  if (status === "ARCHIVED") return "Arquivado";
  return "Rascunho";
}

function toApiStatus(status: BlogPostStatus): AdminBlogPostStatusDto {
  if (status === "Publicado") return "PUBLISHED";
  if (status === "Agendado") return "SCHEDULED";
  if (status === "Arquivado") return "ARCHIVED";
  return "DRAFT";
}

function toAdminPost(post: AdminBlogPostDto, index: number): AdminBlogPost {
  return {
    id: index + 1,
    apiId: post.id,
    title: post.title,
    slug: post.slug,
    tag: post.category?.name ?? "Produto",
    author: "Equipe Ateliux",
    status: mapStatus(post.status),
    date: formatDate(post.publishedAt ?? post.scheduledAt),
    readTime: post.readTime ?? "5 min",
    description: post.excerpt ?? "",
    content: post.content,
  };
}

export function BlogManagementView() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [source, setSource] = useState<"api" | "mock">("api");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "Todos">("Todos");
  const [draft, setDraft] = useState<DraftPost>(emptyDraft);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [previewPost, setPreviewPost] = useState<AdminBlogPost | null>(null);
  const [deletePost, setDeletePost] = useState<AdminBlogPost | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listAdminBlogPosts();
      setPosts(response.map(toAdminPost));
      setSource("api");
    } catch (loadError) {
      if (canUseDevFallback("admin/blog-management")) {
        setPosts([...ADMIN_BLOG_POSTS]);
        setSource("mock");
      } else {
        setPosts([]);
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os artigos.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPosts();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery = `${post.title} ${post.tag} ${post.status} ${post.author}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "Todos" || post.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [posts, query, statusFilter]);

  function openCreate() {
    setEditingPost(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  }

  function openEdit(post: AdminBlogPost) {
    setEditingPost(post);
    setDraft({ ...post });
    setEditorOpen(true);
  }

  async function savePost() {
    const normalizedDraft = { ...draft, slug: draft.slug || createSlug(draft.title) };
    try {
      if (source === "api") {
        const payload = {
          title: normalizedDraft.title,
          slug: normalizedDraft.slug,
          excerpt: normalizedDraft.description,
          content: normalizedDraft.content,
          readTime: normalizedDraft.readTime,
          status: toApiStatus(normalizedDraft.status),
        };
        if (editingPost?.apiId) {
          const updated = await updateAdminBlogPost(editingPost.apiId, payload);
          setPosts((current) => current.map((post) => post.apiId === editingPost.apiId ? toAdminPost(updated, post.id - 1) : post));
        } else {
          const created = await createAdminBlogPost(payload);
          setPosts((current) => [toAdminPost(created, 0), ...current]);
        }
      } else if (editingPost) {
        setPosts((current) => current.map((post) => (post.id === editingPost.id ? { id: editingPost.id, ...normalizedDraft } : post)));
      } else {
        setPosts((current) => [{ id: Date.now(), ...normalizedDraft }, ...current]);
      }
      setEditorOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nao foi possivel salvar o artigo.");
    }
  }

  async function removePost() {
    if (!deletePost) return;
    try {
      if (source === "api" && deletePost.apiId) await deleteAdminBlogPost(deletePost.apiId);
      setPosts((current) => current.filter((post) => post.id !== deletePost.id));
      setDeletePost(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Nao foi possivel excluir o artigo.");
    }
  }

  async function setPostStatus(post: AdminBlogPost, status: BlogPostStatus) {
    try {
      if (source === "api" && post.apiId) {
        const updated = status === "Publicado" ? await publishAdminBlogPost(post.apiId) : status === "Arquivado" ? await archiveAdminBlogPost(post.apiId) : await unpublishAdminBlogPost(post.apiId);
        setPosts((current) => current.map((item) => item.id === post.id ? toAdminPost(updated, post.id - 1) : item));
      } else {
        setPosts((current) => current.map((item) => (item.id === post.id ? { ...item, status } : item)));
      }
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Nao foi possivel atualizar o status.");
    }
  }

  async function duplicatePost(post: AdminBlogPost) {
    const copy = { ...post, title: `${post.title} - copia`, slug: `${post.slug}-copia`, status: "Rascunho" as BlogPostStatus, date: "Hoje" };
    if (source === "api") {
      const created = await createAdminBlogPost({ title: copy.title, slug: copy.slug, excerpt: copy.description, content: copy.content, readTime: copy.readTime, status: "DRAFT" });
      setPosts((current) => [toAdminPost(created, 0), ...current]);
    } else {
      setPosts((current) => [{ ...copy, id: Date.now(), apiId: undefined }, ...current]);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gerenciamento do Blog</h2>
          <p className="text-sm text-gray-500">CRUD dos artigos da Ateliux com rascunho, publicacao, agendamento, arquivo e previa.</p>
        </div>
        <AdminButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo artigo
        </AdminButton>
      </div>

      {error ? <ErrorState title="Falha no blog" description={error} onRetry={loadPosts} /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {statuses.map((status) => (
          <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-3xl border p-5 text-left transition-all ${statusFilter === status ? "border-[#00B074] bg-[#E6F7F1]" : "border-gray-100 bg-white hover:shadow-sm"}`}>
            <Badge variant={statusVariant[status]}>{status}</Badge>
            <p className="mt-4 text-3xl font-bold text-gray-900">{posts.filter((post) => post.status === status).length}</p>
            <p className="mt-1 text-xs text-gray-500">artigos</p>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar artigo..." className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" />
          </div>
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as BlogPostStatus | "Todos")} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm outline-none">
              <option>Todos</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <div className="text-sm text-gray-500">{filteredPosts.length} resultados</div>
          </div>
        </div>

        {loading ? <LoadingState title="Carregando artigos" /> : filteredPosts.length === 0 ? <EmptyState title="Nenhum artigo encontrado" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="rounded-l-xl p-4">Artigo</th>
                  <th className="p-4">Tag</th>
                  <th className="p-4">Autor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data</th>
                  <th className="rounded-r-xl p-4 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPosts.map((post) => (
                  <tr key={post.apiId ?? post.id} className="hover:bg-gray-50/60">
                    <td className="p-4"><p className="font-bold text-gray-900">{post.title}</p><p className="text-xs text-gray-500">/{post.slug}</p></td>
                    <td className="p-4 text-sm text-gray-600">{post.tag}</td>
                    <td className="p-4 text-sm text-gray-600">{post.author}</td>
                    <td className="p-4"><Badge variant={statusVariant[post.status]}>{post.status}</Badge></td>
                    <td className="p-4 text-sm text-gray-500">{post.date}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setPreviewPost(post)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Visualizar previa"><Eye className="h-4 w-4" /></button>
                        <button type="button" onClick={() => openEdit(post)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Editar artigo"><Edit3 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => void duplicatePost(post)} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Duplicar artigo"><Copy className="h-4 w-4" /></button>
                        <button type="button" onClick={() => void setPostStatus(post, post.status === "Publicado" ? "Rascunho" : "Publicado")} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label={post.status === "Publicado" ? "Despublicar artigo" : "Publicar artigo"}><UploadCloud className="h-4 w-4" /></button>
                        <button type="button" onClick={() => void setPostStatus(post, "Arquivado")} className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:text-[#00B074]" aria-label="Arquivar artigo"><Archive className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setDeletePost(post)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Excluir artigo"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isEditorOpen} onClose={() => setEditorOpen(false)} title={editingPost ? "Editar artigo" : "Novo artigo"} description="Preencha os dados do artigo para o blog da Ateliux." size="lg">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-gray-700">Titulo<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value, slug: createSlug(event.target.value) }))} className={inputClassName} /></label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Tag<input value={draft.tag} onChange={(event) => setDraft((current) => ({ ...current, tag: event.target.value }))} className={inputClassName} /></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Status<select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as BlogPostStatus }))} className={inputClassName}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-semibold text-gray-700">Tempo de leitura<input value={draft.readTime} onChange={(event) => setDraft((current) => ({ ...current, readTime: event.target.value }))} className={inputClassName} /></label>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-gray-700">Descricao<textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows={3} className={`${inputClassName} resize-none`} /></label>
          <label className="grid gap-2 text-sm font-semibold text-gray-700">Conteudo<textarea value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} rows={8} className={`${inputClassName} resize-none`} /></label>
          <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setEditorOpen(false)}>Cancelar</AdminButton><AdminButton onClick={() => void savePost()}>{editingPost ? "Salvar alteracoes" : "Criar artigo"}</AdminButton></div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(previewPost)} onClose={() => setPreviewPost(null)} title="Previa geral do artigo" size="lg">
        {previewPost ? <article className="space-y-4"><Badge variant={statusVariant[previewPost.status]}>{previewPost.status}</Badge><h1 className="text-3xl font-bold text-gray-900">{previewPost.title}</h1><p className="text-gray-500">{previewPost.description}</p><div className="rounded-2xl bg-gray-50 p-5 text-sm leading-7 text-gray-700">{previewPost.content}</div></article> : null}
      </Modal>

      <Modal isOpen={Boolean(deletePost)} onClose={() => setDeletePost(null)} title="Excluir artigo" description="Esta acao remove o artigo do backend quando a API esta conectada.">
        {deletePost ? <div className="space-y-5"><p className="text-sm text-gray-600">Confirma a exclusao de <strong>{deletePost.title}</strong>?</p><div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDeletePost(null)}>Cancelar</AdminButton><AdminButton variant="danger" onClick={() => void removePost()}>Excluir</AdminButton></div></div> : null}
      </Modal>
    </div>
  );
}
