import { Sparkles } from "lucide-react";

import type { PredictionResult, ReportExtraction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InsightsPanel({
  prediction,
  latestReport,
}: {
  prediction: PredictionResult | null;
  latestReport?: ReportExtraction;
}) {
  const insights = [...(prediction?.insights ?? []), ...(latestReport?.insights ?? [])];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-[var(--font-display)] text-2xl">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Actionable insights
        </CardTitle>
        <CardDescription>
          Short, human-readable takeaways based on your current risk profile and report values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length ? (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight} className="rounded-[1.5rem] bg-white/70 px-4 py-4 text-sm leading-6 text-slate-700">
                {insight}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-muted-foreground">
            Generate a prediction or upload a report to receive contextual guidance.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

