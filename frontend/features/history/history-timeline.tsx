import { format } from "date-fns";

import type { HealthRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getVariant(category: string) {
  if (category === "high") return "danger";
  if (category === "medium") return "warning";
  return "default";
}

export function HistoryTimeline({ records }: { records: HealthRecord[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Health history</CardTitle>
        <CardDescription>Every prediction and report sync is saved into a clear timeline.</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length ? (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="relative rounded-[1.5rem] border border-white/70 bg-white/76 p-5 dark:border-white/12 dark:bg-white/6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{format(new Date(record.recorded_at), "MMM d, yyyy • h:mm a")}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Glucose {record.glucose ?? "--"} • HbA1c {record.hba1c ?? "--"} • Cholesterol {record.cholesterol ?? "--"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Risk score</div>
                      <div className="text-2xl font-semibold">{Math.round(record.risk_score)}%</div>
                    </div>
                    <Badge variant={getVariant(record.category)}>{record.category}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-muted-foreground dark:border-white/14 dark:bg-white/6">
            Your timeline will appear here as soon as the first assessment is saved.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

