import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalClientePage() {
  return (
    <AdminShell title="Portal do Cliente">
      <PortalManagementView section="clients" />
    </AdminShell>
  );
}
