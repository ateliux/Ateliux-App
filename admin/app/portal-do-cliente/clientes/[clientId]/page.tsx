import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

type PortalClientWorkspacePageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function PortalClientWorkspacePage({ params }: PortalClientWorkspacePageProps) {
  const { clientId } = await params;

  return (
    <AdminShell title="Workspace do Cliente">
      <PortalManagementView section="workspace" clientId={clientId} />
    </AdminShell>
  );
}
