import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalEtapasPage() {
  return (
    <AdminShell title="Etapas do Portal">
      <PortalManagementView section="stages" />
    </AdminShell>
  );
}
