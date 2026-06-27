import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalProjetosPage() {
  return (
    <AdminShell title="Projetos do Portal">
      <PortalManagementView section="projects" />
    </AdminShell>
  );
}
