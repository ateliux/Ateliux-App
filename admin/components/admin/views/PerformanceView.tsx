import { Filter, MoreHorizontal } from "lucide-react";
import { MOCK_USERS } from "@/data/admin/admin-mock-data";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";
import { CircularProgress } from "@/components/admin/ui/CircularProgress";

export function PerformanceView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Desempenho</h2>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm" type="button">
          <Filter className="h-4 w-4" /> Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Desempenho da Equipe</h3>
            <select className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 outline-none" defaultValue="Último Ano">
              <option>Último Ano</option>
            </select>
          </div>

          <div className="flex h-64 items-end justify-between gap-4 pt-4">
            {[60, 80, 45, 90, 75, 50, 85, 65, 95, 70, 55, 80].map((height, index) => (
              <div key={index} className="group flex w-full flex-col items-center gap-2">
                <div className="relative flex h-48 w-full items-end rounded-t-lg bg-gray-50">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${index === 8 ? "bg-[#00B074]" : "bg-[#A7F3D0] group-hover:bg-[#34D399]"}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-400">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 w-full text-left font-bold text-gray-900">Desempenho Médio</h3>
          <CircularProgress value={87} max={100} colorClass="text-[#00B074]" size="large" />
          <p className="mt-6 text-center text-sm leading-relaxed text-gray-500">
            A equipe atingiu <strong className="text-gray-800">87%</strong> da meta de desempenho este mês.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-6 font-bold text-gray-900">Desempenho por Categoria</h3>
          <div className="space-y-5">
            {[
              { label: "Qualidade do trabalho", value: 92 },
              { label: "Pontualidade", value: 85 },
              { label: "Trabalho em equipe", value: 88 },
              { label: "Comunicação", value: 78 }
            ].map((category) => (
              <div key={category.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{category.label}</span>
                  <span className="font-semibold text-gray-500">{category.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#00B074]" style={{ width: `${category.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Melhores Desempenhos</h3>
            <MoreHorizontal className="h-5 w-5 cursor-pointer text-gray-400" />
          </div>
          <div className="space-y-4">
            {MOCK_USERS.slice(0, 4).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-gray-400">{index + 1}</span>
                  <Avatar src={user.avatar} size="h-8 w-8" alt={user.name} />
                  <div>
                    <p className="text-sm font-semibold leading-tight text-gray-800">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.role}</p>
                  </div>
                </div>
                <span className="rounded-md bg-[#E6F7F1] px-2 py-1 text-xs font-bold text-[#00B074]">{98 - index * 3}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
