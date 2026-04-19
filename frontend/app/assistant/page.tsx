import { PageShell } from "@/components/layout/page-shell";
import { HealthAssistantView } from "@/features/assistant/health-assistant-view";

export default function AssistantPage() {
  return (
    <PageShell>
      <div className="py-8">
        <HealthAssistantView />
      </div>
    </PageShell>
  );
}
