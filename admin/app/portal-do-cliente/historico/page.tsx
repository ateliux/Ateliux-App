import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalHistoricoPage() {
  return (
    <AdminShell title="Histórico do Portal">
      <PortalManagementView section="history" />
    </AdminShell>
  );
}
