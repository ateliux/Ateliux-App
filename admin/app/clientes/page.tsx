import { AdminShell } from "@/components/admin/layout/AdminShell";
import { ClientsManagementView } from "@/components/admin/views/ClientsManagementView";

export default function ClientesPage() {
  return (
    <AdminShell title="Clientes">
      <ClientsManagementView />
    </AdminShell>
  );
}
