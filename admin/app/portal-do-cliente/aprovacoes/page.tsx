import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalAprovacoesPage() {
  return (
    <AdminShell title="Aprovações do Portal">
      <PortalManagementView section="approvals" />
    </AdminShell>
  );
}
