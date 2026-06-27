import { AdminShell } from "@/components/admin/layout/AdminShell";
import { NewsletterManagementView } from "@/components/admin/views/NewsletterManagementView";

export default function NewsletterPage() {
  return (
    <AdminShell title="Newsletter">
      <NewsletterManagementView />
    </AdminShell>
  );
}
