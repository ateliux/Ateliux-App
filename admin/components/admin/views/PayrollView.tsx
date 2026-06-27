import { AlertCircle, Briefcase, DollarSign, Download, Search, TrendingUp } from "lucide-react";
import { PAYROLL_DATA } from "@/data/admin/admin-mock-data";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";
import { MetricCard } from "@/components/admin/ui/MetricCard";

export function PayrollView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Folha de Pagamento</h2>
        <button className="rounded-xl bg-[#00B074] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#009662]" type="button">
          Gerar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total da folha" value="R$ 352.000" icon={<DollarSign />} trend={2.4} />
        <MetricCard title="Abonos totais" value="R$ 15.000" icon={<TrendingUp />} trend={1.2} />
        <MetricCard title="Deduções totais" value="R$ 4.800" icon={<AlertCircle />} trend={-0.5} />
        <MetricCard title="Salário líquido" value="R$ 378.300" icon={<Briefcase />} trend={3.1} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Lista de Pagamentos (Outubro 2035)</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Pesquisar funcionário..." className="rounded-lg border border-gray-100 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500">
                <th className="rounded-bl-xl rounded-tl-xl p-4 font-semibold">Funcionário</th>
                <th className="p-4 font-semibold">Salário base</th>
                <th className="p-4 font-semibold">Abonos</th>
                <th className="p-4 font-semibold">Deduções</th>
                <th className="p-4 font-semibold">Líquido</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="rounded-br-xl rounded-tr-xl p-4 text-center font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PAYROLL_DATA.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="flex items-center gap-3 p-4">
                    <Avatar src={row.user.avatar} size="h-8 w-8" alt={row.user.name} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{row.user.name}</p>
                      <p className="text-[10px] text-gray-500">{row.user.role}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">{row.base}</td>
                  <td className="p-4 text-sm font-medium text-[#00B074]">+{row.allow}</td>
                  <td className="p-4 text-sm font-medium text-red-500">-{row.deduc}</td>
                  <td className="p-4 text-sm font-bold text-gray-900">{row.net}</td>
                  <td className="p-4">
                    <Badge variant={row.status === "Pago" ? "green" : "yellow"}>{row.status}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <button className="mx-auto flex items-center gap-1 rounded-lg bg-[#E6F7F1] px-3 py-1.5 text-xs font-semibold text-[#00B074] transition-colors hover:bg-[#D1F0E3]" type="button">
                      <Download className="h-3 w-3" /> Recibo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
