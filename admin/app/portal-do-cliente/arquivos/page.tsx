import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalArquivosPage() {
  return (
    <AdminShell title="Arquivos do Portal">
      <PortalManagementView section="files" />
    </AdminShell>
  );
}
