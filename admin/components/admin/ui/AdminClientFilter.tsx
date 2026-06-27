import type { PortalClientRecord } from "@/types/admin";

type AdminClientFilterProps = {
  clients: readonly PortalClientRecord[];
  selectedClientId: string;
  onChange: (clientId: string) => void;
  allowAll?: boolean;
  locked?: boolean;
  label?: string;
};

export function AdminClientFilter({ clients, selectedClientId, onChange, allowAll = true, locked = false, label = "Cliente selecionado" }: AdminClientFilterProps) {
  const selectedClient = clients.find((client) => client.id === selectedClientId);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{selectedClient ? selectedClient.company : "Todos os clientes"}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedClient ? `${selectedClient.name} - ${selectedClient.email}` : "Use um cliente especifico para criar ou enviar itens ao portal."}
          </p>
        </div>
        <select
          value={selectedClientId}
          disabled={locked}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-64 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[#00B074] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {allowAll ? <option value="all">Todos os clientes</option> : null}
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
