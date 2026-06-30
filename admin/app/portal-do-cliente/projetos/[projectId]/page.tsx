import { AdminShell } from "@/components/admin/layout/AdminShell";
import { ProjectWorkspaceView } from "@/components/admin/project-workspace/ProjectWorkspaceView";

type ProjectWorkspacePageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectWorkspacePage({ params }: ProjectWorkspacePageProps) {
  const { projectId } = await params;

  return (
    <AdminShell title="Workspace do Projeto">
      <ProjectWorkspaceView projectId={projectId} />
    </AdminShell>
  );
}
