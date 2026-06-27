import { AdminShell } from "@/components/admin/layout/AdminShell";
import { FileReviewView } from "@/components/admin/views/FileReviewView";

export default function FileReviewPage() {
  return (
    <AdminShell title="Revisao de Arquivos">
      <FileReviewView />
    </AdminShell>
  );
}
