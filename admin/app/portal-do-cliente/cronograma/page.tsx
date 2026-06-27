import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalCronogramaPage() {
  return (
    <AdminShell title="Cronograma do Portal">
      <PortalManagementView section="schedule" />
    </AdminShell>
  );
}
