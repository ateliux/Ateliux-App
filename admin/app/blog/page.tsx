import { AdminShell } from "@/components/admin/layout/AdminShell";
import { BlogManagementView } from "@/components/admin/views/BlogManagementView";

export default function BlogAdminPage() {
  return (
    <AdminShell title="Blog">
      <BlogManagementView />
    </AdminShell>
  );
}
