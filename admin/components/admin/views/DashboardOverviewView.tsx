import Link from "next/link";
import { BookOpen, Eye, Inbox, KanbanSquare, MailCheck, MessageSquare, Users } from "lucide-react";
import {
  ADMIN_BLOG_POSTS,
  ADMIN_CLIENTS,
  NEWSLETTER_SUBSCRIBERS,
  PORTAL_APPROVALS,
  PORTAL_PREVIEWS,
  PORTAL_REQUESTS,
  SUPPORT_TICKETS,
} from "@/data/admin/admin-mock-data";
import { MetricCard } from "@/components/admin/ui/MetricCard";
import { Badge } from "@/components/admin/ui/Badge";

function QuickAction({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <p className="font-bold text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
    </Link>
  );
}

export function DashboardOverviewView() {
  const openTickets = SUPPORT_TICKETS.filter((ticket) => ticket.status !== "Encerrado").length;
  const pendingApprovals = PORTAL_APPROVALS.filter((approval) => approval.status === "Pendente").length;
  const activeClients = ADMIN_CLIENTS.filter((client) => client.accountStatus !== "Inativa").length;
  const activePosts = ADMIN_BLOG_POSTS.filter((post) => post.status === "Publicado").length;
  const newPortalRequests = PORTAL_REQUESTS.filter((request) => request.status === "Nova").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Painel administrativo</h2>
          <p className="text-sm text-gray-500">Controle central da Ateliux: clientes, blog, suporte, portal e newsletter.</p>
        </div>
        <Badge variant="green">Ambiente interno</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Clientes com conta" value={activeClients} icon={<Users className="h-5 w-5" />} trend={12} />
        <MetricCard title="Posts publicados" value={activePosts} icon={<BookOpen className="h-5 w-5" />} trend={8} />
        <MetricCard title="Chamados abertos" value={openTickets} icon={<MessageSquare className="h-5 w-5" />} trend={-4} />
        <MetricCard title="Aprovacoes pendentes" value={pendingApprovals} icon={<KanbanSquare className="h-5 w-5" />} trend={3} />
        <MetricCard title="Newsletter" value={NEWSLETTER_SUBSCRIBERS.length} icon={<MailCheck className="h-5 w-5" />} trend={18} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <QuickAction href="/clientes" title="Gerenciar clientes" description="Kanban, lista, status e criacao de projetos reais por cliente." />
        <QuickAction href="/blog" title="Operar blog" description="Criar, revisar, agendar, publicar ou arquivar artigos." />
        <QuickAction href="/dashboard?view=inbox" title="Responder suporte" description="Central unificada de tickets e solicitacoes do portal." />
        <QuickAction href="/portal-do-cliente/previews" title="Enviar previews" description="Criar links de preview e enviar para aprovacao." />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Projetos em andamento</h3>
            <Link href="/portal-do-cliente/projetos" className="text-sm font-semibold text-[#00B074] hover:text-[#009662]">
              Ver portal
            </Link>
          </div>
          <div className="space-y-4">
            {ADMIN_CLIENTS.slice(0, 5).map((client) => (
              <div key={client.id} className="rounded-2xl border border-gray-100 p-4 transition-colors hover:bg-gray-50/60">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{client.project}</h4>
                    <p className="text-sm text-gray-500">
                      {client.company} - {client.responsible}
                    </p>
                  </div>
                  <Badge variant={client.progress >= 70 ? "green" : client.progress >= 40 ? "yellow" : "blue"}>{client.progress}%</Badge>
                </div>
                <div className="mb-2 h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#00B074]" style={{ width: `${client.progress}%` }} />
                </div>
                <p className="text-xs text-gray-500">{client.lastUpdate}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Fila de suporte</h3>
              <Inbox className="h-5 w-5 text-[#00B074]" />
            </div>
            <div className="space-y-3">
              {SUPPORT_TICKETS.map((ticket) => (
                <Link key={ticket.id} href="/dashboard?view=inbox" className="block rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">{ticket.code}</span>
                    <Badge variant={ticket.priority === "Alta" || ticket.priority === "Urgente" ? "red" : ticket.priority === "Media" ? "yellow" : "gray"}>{ticket.priority}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {ticket.client} - {ticket.status}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Portal agora</h3>
              <Eye className="h-5 w-5 text-[#00B074]" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-2xl font-bold text-gray-900">{newPortalRequests}</p>
                <p className="mt-1 text-[11px] text-gray-500">Novas</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p>
                <p className="mt-1 text-[11px] text-gray-500">Aprovacoes</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-2xl font-bold text-gray-900">{PORTAL_PREVIEWS.length}</p>
                <p className="mt-1 text-[11px] text-gray-500">Previews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
