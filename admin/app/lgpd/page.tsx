import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PrivacyManagementView } from "@/components/admin/views/PrivacyManagementView";

export default function LgpdPage() {
  return (
    <AdminShell title="LGPD">
      <PrivacyManagementView />
    </AdminShell>
  );
}
