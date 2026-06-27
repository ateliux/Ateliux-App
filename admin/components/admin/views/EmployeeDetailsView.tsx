import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { CircularProgress } from "@/components/admin/ui/CircularProgress";

export function EmployeeDetailsView() {
  return (
    <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 animate-in fade-in duration-500 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-3">
        <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="absolute top-0 h-24 w-full bg-gradient-to-b from-[#E6F7F1] to-white" />
          <Image
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&h=250&fit=crop"
            alt="Mia Torres"
            width={250}
            height={250}
            className="relative z-10 mb-4 h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
          />
          <h2 className="text-xl font-bold text-gray-900">Mia Torres</h2>
          <p className="mb-4 text-sm text-gray-500">Responsável de Recursos Humanos</p>
          <div className="mb-8 flex gap-2">
            <Badge variant="gray">COL-0289</Badge>
            <Badge variant="green">Ativo</Badge>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Informações Pessoais</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <Mail className="h-5 w-5 text-[#00B074]" />
              <div>
                <p className="text-xs text-gray-400">E-mail</p>
                <p className="text-sm font-semibold text-gray-800">mia.torres@empresa.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="h-5 w-5 text-[#00B074]" />
              <div>
                <p className="text-xs text-gray-400">Telefone</p>
                <p className="text-sm font-semibold text-gray-800">+55 11 99999-0000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 xl:col-span-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <CircularProgress value={14} max={20} label="Total de licenças" colorClass="text-[#00B074]" />
          <CircularProgress value={10} max={16} label="Férias" colorClass="text-blue-500" />
          <CircularProgress value={8} max={24} label="Casuais" colorClass="text-orange-400" />
          <CircularProgress value={3} max={14} label="Médicas" colorClass="text-purple-500" />
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-gray-900">Visão Geral do Desempenho</h3>
          <div className="mb-8 flex items-center gap-2">
            <span className="text-2xl font-bold">86,75%</span>
            <Badge variant="green">+2,05%</Badge>
          </div>
          <div className="flex h-48 items-end justify-between gap-2 pt-4">
            {[40, 50, 45, 60, 55, 70, 65, 80, 85, 80, 90, 85].map((height, index) => (
              <div key={index} className="w-full rounded-t-sm bg-[#E6F7F1]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 xl:col-span-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Resumo da Folha</h3>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-gray-600">Salário base</span><span className="font-bold">R$ 3.200</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Abonos</span><span className="font-bold">+R$ 300</span></div>
            <div className="flex justify-between border-t pt-4"><span className="font-bold">Líquido</span><span className="text-xl font-bold text-[#00B074]">R$ 3.500</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
