import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

export default function PortalFinanceiroPage() {
  return (
    <AdminShell title="Financeiro do Portal">
      <PortalManagementView section="billing" />
    </AdminShell>
  );
}
