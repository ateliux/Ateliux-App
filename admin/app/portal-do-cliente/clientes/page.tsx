import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalClientesPage() {
  return (
    <AdminShell title="Clientes do Portal">
      <PortalManagementView section="clients" />
    </AdminShell>
  );
}
