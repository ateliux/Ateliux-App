import { AdminShell } from "@/components/admin/layout/AdminShell";
import { AdminDashboardRouter } from "@/components/admin/views/AdminDashboardRouter";

type DashboardPageProps = {
  searchParams?: Promise<{ view?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const title = params?.view === "inbox" ? "Caixa de Entrada" : "Painel";

  return (
    <AdminShell title={title}>
      <AdminDashboardRouter view={params?.view} />
    </AdminShell>
  );
}
