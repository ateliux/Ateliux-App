"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, FileText, ReceiptText } from "lucide-react";
import { clientInvoices, clientProjects } from "@/data/client-portal/client-portal-mock-data";
import { canUseDevFallback } from "@/lib/env/is-dev-fallback-enabled";
import { toClientInvoice, toClientProject } from "@/lib/client-portal/api-adapters";
import { listClientFinance } from "@/services/client-finance.service";
import { listClientProjects } from "@/services/client-projects.service";
import type { ClientInvoice } from "@/types/client-portal";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { ClientPortalBadge } from "@/components/client-portal/ui/ClientPortalBadge";
import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";
import { ClientPortalCard } from "@/components/client-portal/ui/ClientPortalCard";
import { ClientPortalModal } from "@/components/client-portal/ui/ClientPortalModal";
import { ClientPortalPageHeader } from "@/components/client-portal/ui/ClientPortalPageHeader";
import { statusVariant } from "@/components/client-portal/ui/client-portal-status";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const statusLabel: Record<ClientInvoice["status"], string> = { paid: "Pago", pending: "Pendente", overdue: "Em atraso" };

export function ClientBillingPage() {
  const [project, setProject] = useState(() => clientProjects[0]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [receipt, setReceipt] = useState<ClientInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadFinance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [financeResponse, projectResponse] = await Promise.all([
        listClientFinance<Record<string, unknown>>(),
        listClientProjects<Record<string, unknown>>(),
      ]);
      setInvoices(financeResponse.map(toClientInvoice));
      if (projectResponse[0]) setProject(toClientProject(projectResponse[0]));
    } catch (loadError) {
      if (canUseDevFallback("frontend/client-finance")) {
        setInvoices(clientInvoices);
        setProject(clientProjects[0]);
      } else {
        setInvoices([]);
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o financeiro.");
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFinance();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadFinance]);
  const total = invoices.reduce((sum, item) => sum + item.amount, 0);
  const next = invoices.find((item) => item.status === "pending");
  return <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><ClientPortalPageHeader eyebrow="Plano e pagamentos" title="Financeiro" description="Consulte o plano contratado, parcelas e comprovantes do projeto." actions={<Link href="/cliente/suporte" className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Falar sobre pagamento</Link>} />{loading ? <LoadingState title="Carregando financeiro" /> : error ? <ErrorState title="Nao foi possivel carregar o financeiro" description={error} onRetry={loadFinance} /> : invoices.length === 0 ? <EmptyState title="Nenhuma cobranca publicada" description="Quando uma cobranca visivel for criada pela Ateliux, ela aparecera aqui." /> : <><div className="mb-6 grid gap-5 sm:grid-cols-3"><ClientPortalCard className="p-5"><CreditCard className="h-5 w-5" /><p className="mt-4 text-xs text-slate-400">Plano contratado</p><p className="mt-1 font-bold text-slate-900">{project.plan}</p></ClientPortalCard><ClientPortalCard className="p-5"><ReceiptText className="h-5 w-5" /><p className="mt-4 text-xs text-slate-400">Valor total</p><p className="mt-1 font-bold text-slate-900">{currency.format(total)}</p></ClientPortalCard><ClientPortalCard className="p-5"><FileText className="h-5 w-5" /><p className="mt-4 text-xs text-slate-400">Proximo vencimento</p><p className="mt-1 font-bold text-slate-900">{next?.dueDate ?? "Tudo quitado"}</p></ClientPortalCard></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><ClientPortalCard className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="p-4">Parcela</th><th className="p-4">Vencimento</th><th className="p-4">Valor</th><th className="p-4">Status</th><th className="p-4">Acao</th></tr></thead><tbody className="divide-y divide-slate-100">{invoices.map((invoice) => <tr key={invoice.id}><td className="p-4 text-sm font-semibold text-slate-900">{invoice.label}</td><td className="p-4 text-sm text-slate-500">{invoice.dueDate}</td><td className="p-4 text-sm text-slate-700">{currency.format(invoice.amount)}</td><td className="p-4"><ClientPortalBadge variant={statusVariant(invoice.status)}>{statusLabel[invoice.status]}</ClientPortalBadge></td><td className="p-4">{invoice.status === "paid" ? <ClientPortalButton variant="secondary" onClick={() => setReceipt(invoice)}>Ver recibo</ClientPortalButton> : <Link href="/cliente/suporte" className="text-xs font-semibold text-black">Solicitar 2a via</Link>}</td></tr>)}</tbody></table></ClientPortalCard><ClientPortalCard className="p-6"><h2 className="font-bold text-slate-900">Incluso no plano</h2><ul className="mt-4 space-y-3 text-sm text-slate-600">{["Design responsivo completo", "Desenvolvimento frontend", "Integracoes previstas no escopo", "Publicacao e suporte inicial"].map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-black" />{item}</li>)}</ul><h3 className="mt-6 text-sm font-bold text-slate-900">Possiveis adicionais</h3><p className="mt-2 text-xs leading-5 text-slate-500">Novas paginas, integracoes ou alteracoes fora do escopo serao avaliadas antes da execucao.</p><Link href="/cliente/solicitacoes" className="mt-4 inline-flex text-xs font-semibold text-black">Solicitar adicional</Link></ClientPortalCard></div></>}{receipt ? <ClientPortalModal title={`Recibo: ${receipt.label}`} description="Documento financeiro carregado do registro do projeto." onClose={() => setReceipt(null)}><div className="rounded-xl border border-slate-100 p-5"><div className="flex justify-between text-sm"><span className="text-slate-500">Valor pago</span><strong>{currency.format(receipt.amount)}</strong></div><div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">Data do pagamento</span><strong>{receipt.paidAt}</strong></div><div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">Situacao</span><ClientPortalBadge variant="success">Pago</ClientPortalBadge></div></div><p className="mt-4 text-xs text-slate-400">Recibos reais devem ser baixados pelo endpoint de arquivos aprovados.</p></ClientPortalModal> : null}</div>;
}
