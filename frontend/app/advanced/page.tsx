import { PageShell } from "@/components/layout/page-shell";
import { AdvancedView } from "@/features/advanced/advanced-view";

export default function AdvancedPage() {
  return (
    <PageShell>
      <div className="py-8">
        <AdvancedView />
      </div>
    </PageShell>
  );
}
