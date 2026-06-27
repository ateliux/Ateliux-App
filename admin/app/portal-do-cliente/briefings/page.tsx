import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalBriefingsPage() {
  return (
    <AdminShell title="Briefings do Portal">
      <PortalManagementView section="briefings" />
    </AdminShell>
  );
}
