"use client";

import { Download, MailCheck, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { NEWSLETTER_SUBSCRIBERS } from "@/data/admin/admin-mock-data";
import type { NewsletterSubscriber, NewsletterSubscriberStatus } from "@/types/admin";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { Badge } from "@/components/admin/ui/Badge";
import { Modal } from "@/components/admin/ui/Modal";

const subscriberVariant: Record<NewsletterSubscriberStatus, "green" | "yellow" | "gray"> = {
  Ativo: "green",
  Novo: "yellow",
  Descadastrado: "gray",
};

const emptyDraft: NewsletterSubscriber = {
  id: 0,
  email: "",
  name: "",
  origin: "Admin",
  status: "Novo",
  createdAt: "Hoje",
  interests: ["Produto"],
};

export function NewsletterManagementView() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([...NEWSLETTER_SUBSCRIBERS]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<NewsletterSubscriber>(emptyDraft);
  const [deleteSubscriber, setDeleteSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredSubscribers = useMemo(() => subscribers.filter((subscriber) => `${subscriber.email} ${subscriber.name} ${subscriber.origin}`.toLowerCase().includes(query.toLowerCase())), [subscribers, query]);

  function saveSubscriber() {
    setSubscribers((current) => [{ ...draft, id: Date.now(), interests: draft.interests.length ? draft.interests : ["Produto"] }, ...current]);
    setCreateOpen(false);
    setDraft(emptyDraft);
  }

  function updateStatus(id: number, status: NewsletterSubscriberStatus) {
    setSubscribers((current) => current.map((subscriber) => (subscriber.id === id ? { ...subscriber, status } : subscriber)));
  }

  function removeSubscriber() {
    if (!deleteSubscriber) return;
    setSubscribers((current) => current.filter((subscriber) => subscriber.id !== deleteSubscriber.id));
    setDeleteSubscriber(null);
  }

  function exportCsv() {
    setNotice(`${filteredSubscribers.length} assinantes preparados para exportacao CSV mockada.`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Assinaturas da Newsletter</h2>
          <p className="text-sm text-gray-500">E-mails capturados no blog para receber novidades e novas postagens da Ateliux.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminButton variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Exportar CSV</AdminButton>
          <AdminButton onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Novo assinante</AdminButton>
        </div>
      </div>

      {notice ? <div className="rounded-2xl border border-[#A7F3D0] bg-[#E6F7F1] px-4 py-3 text-sm font-semibold text-[#00B074]">{notice}</div> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><MailCheck className="mb-4 h-8 w-8 text-[#00B074]" /><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total capturado</p><h3 className="mt-2 text-3xl font-bold text-gray-900">{subscribers.length}</h3></div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Novos leads</p><h3 className="mt-2 text-3xl font-bold text-gray-900">{subscribers.filter((item) => item.status === "Novo").length}</h3><p className="mt-2 text-sm text-[#00B074]">Entraram recentemente</p></div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Interesses principais</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="green">SaaS</Badge><Badge variant="blue">E-commerce</Badge><Badge variant="yellow">Design</Badge></div></div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar e-mail..." className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" />
          </div>
          <span className="text-sm text-gray-500">{filteredSubscribers.length} resultados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500">
              <tr><th className="rounded-l-xl p-4">Assinante</th><th className="p-4">Origem</th><th className="p-4">Interesses</th><th className="p-4">Entrada</th><th className="p-4">Status</th><th className="rounded-r-xl p-4 text-right">Acoes</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50/60">
                  <td className="p-4"><p className="font-bold text-gray-900">{subscriber.name}</p><p className="text-xs text-gray-500">{subscriber.email}</p></td>
                  <td className="p-4 text-sm text-gray-600">{subscriber.origin}</td>
                  <td className="p-4"><div className="flex flex-wrap gap-1">{subscriber.interests.map((interest) => <span key={interest} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">{interest}</span>)}</div></td>
                  <td className="p-4 text-sm text-gray-500">{subscriber.createdAt}</td>
                  <td className="p-4"><Badge variant={subscriberVariant[subscriber.status]}>{subscriber.status}</Badge></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => updateStatus(subscriber.id, "Ativo")} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#00B074]">Ativar</button>
                      <button type="button" onClick={() => updateStatus(subscriber.id, "Descadastrado")} className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900">Descadastrar</button>
                      <button type="button" onClick={() => setDeleteSubscriber(subscriber)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" aria-label="Remover assinante"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Novo assinante" description="Cadastro mockado para administracao da lista.">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-gray-700">Nome<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" /></label>
          <label className="grid gap-2 text-sm font-semibold text-gray-700">E-mail<input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" /></label>
          <label className="grid gap-2 text-sm font-semibold text-gray-700">Interesses<input value={draft.interests.join(", ")} onChange={(event) => setDraft((current) => ({ ...current, interests: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00B074]/20" /></label>
          <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</AdminButton><AdminButton onClick={saveSubscriber}>Salvar</AdminButton></div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(deleteSubscriber)} onClose={() => setDeleteSubscriber(null)} title="Remover assinante">
        {deleteSubscriber ? (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">Confirma a remocao de <strong>{deleteSubscriber.email}</strong>?</p>
            <div className="flex justify-end gap-3"><AdminButton variant="secondary" onClick={() => setDeleteSubscriber(null)}>Cancelar</AdminButton><AdminButton variant="danger" onClick={removeSubscriber}>Remover</AdminButton></div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
