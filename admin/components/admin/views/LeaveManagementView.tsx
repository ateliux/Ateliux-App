import { LEAVE_ACTIVITY } from "@/data/admin/admin-mock-data";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";
import { CircularProgress } from "@/components/admin/ui/CircularProgress";

export function LeaveManagementView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Gestão de Licenças</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid grid-cols-3 gap-4 lg:col-span-2">
          <CircularProgress value={6} max={20} label="Licenças ativas hoje" colorClass="text-[#00B074]" size="large" />
          <CircularProgress value={3} max={15} label="Pendentes" colorClass="text-yellow-400" size="large" />
          <CircularProgress value={2} max={10} label="Agendadas" colorClass="text-blue-500" size="large" />
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <h3 className="mb-2 font-bold text-gray-900">Tipos de Licença</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#00B074]" /> Férias (60%)</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> Licença médica (25%)</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400" /> Outras (15%)</li>
            </ul>
          </div>
          <CircularProgress value={100} max={100} colorClass="text-[#00B074]" />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Atividade Recente de Licenças</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F4F7F6] text-xs uppercase tracking-wider text-gray-500">
                <th className="rounded-bl-xl rounded-tl-xl p-4 font-semibold">Funcionário</th>
                <th className="p-4 font-semibold">Tipo</th>
                <th className="p-4 font-semibold">Datas</th>
                <th className="p-4 font-semibold">Dias</th>
                <th className="rounded-br-xl rounded-tr-xl p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {LEAVE_ACTIVITY.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="flex items-center gap-3 p-4">
                    <Avatar src={row.user.avatar} size="h-8 w-8" alt={row.user.name} />
                    <span className="text-sm font-semibold text-gray-800">{row.user.name}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">{row.type}</td>
                  <td className="p-4 text-sm text-gray-500">{row.dates}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{row.days}</td>
                  <td className="p-4">
                    <Badge variant={row.status === "Aprovado" ? "green" : row.status === "Rejeitado" ? "red" : "yellow"}>{row.status}</Badge>
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
