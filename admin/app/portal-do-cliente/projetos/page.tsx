import { AdminShell } from "@/components/admin/layout/AdminShell";
import { PortalManagementView } from "@/components/admin/views/PortalManagementView";

type PortalProjetosPageProps = {
  searchParams?: Promise<{ clientId?: string; create?: string }>;
};

export default async function PortalProjetosPage({ searchParams }: PortalProjetosPageProps) {
  const params = await searchParams;
  const clientId = typeof params?.clientId === "string" && params.clientId.trim() ? params.clientId : undefined;

  return (
    <AdminShell title="Projetos do Portal">
      <PortalManagementView section="projects" clientId={clientId} createProject={params?.create === "1"} />
    </AdminShell>
  );
}
