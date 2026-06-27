import { LayoutDashboard } from "lucide-react";
import { CalendarView } from "@/components/admin/views/CalendarView";
import { DashboardOverviewView } from "@/components/admin/views/DashboardOverviewView";
import { EmployeeDetailsView } from "@/components/admin/views/EmployeeDetailsView";
import { InboxView } from "@/components/admin/views/InboxView";
import { LeaveManagementView } from "@/components/admin/views/LeaveManagementView";
import { PayrollView } from "@/components/admin/views/PayrollView";
import { PerformanceView } from "@/components/admin/views/PerformanceView";

type AdminDashboardRouterProps = {
  view?: string;
};

function EmptyDashboardView({ view }: { view: string }) {
  return (
    <div className="flex h-96 flex-col items-center justify-center text-gray-400">
      <LayoutDashboard className="mb-4 h-16 w-16 opacity-20" />
      <p className="text-lg font-medium text-gray-500">
        A visão <span className="font-bold text-gray-700">{view}</span> está em desenvolvimento.
      </p>
      <p className="text-sm">Use o menu lateral para acessar as áreas administrativas principais.</p>
    </div>
  );
}

export function AdminDashboardRouter({ view }: AdminDashboardRouterProps) {
  switch (view) {
    case "inbox":
      return <InboxView />;
    case "calendar":
      return <CalendarView />;
    case "employees":
      return <EmployeeDetailsView />;
    case "performance":
      return <PerformanceView />;
    case "payroll":
      return <PayrollView />;
    case "leave":
      return <LeaveManagementView />;
    case "recruitment":
      return <EmptyDashboardView view="Recrutamento" />;
    default:
      return <DashboardOverviewView />;
  }
}
