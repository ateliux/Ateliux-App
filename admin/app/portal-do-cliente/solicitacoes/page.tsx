import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalSolicitacoesPage() {
  return (
    <AdminShell title="Solicitações do Portal">
      <PortalManagementView section="requests" />
    </AdminShell>
  );
}
