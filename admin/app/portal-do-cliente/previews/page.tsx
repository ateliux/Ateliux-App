import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalPreviewsPage() {
  return (
    <AdminShell title="Previews do Portal">
      <PortalManagementView section="previews" />
    </AdminShell>
  );
}
