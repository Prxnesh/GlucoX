import { PageShell } from "@/components/layout/page-shell";
import { DashboardView } from "@/features/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <PageShell>
      <div className="py-8">
        <DashboardView />
      </div>
    </PageShell>
  );
}
