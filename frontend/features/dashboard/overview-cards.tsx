import { ArrowDownRight, ArrowUpRight, ShieldCheck, TriangleAlert } from "lucide-react";

import type { HealthRecord, PredictionResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function categoryVariant(category: string) {
  if (category === "high") return "danger";
  if (category === "medium") return "warning";
  return "default";
}

export function OverviewCards({
  latestPrediction,
  records,
}: {
  latestPrediction: PredictionResult | null;
  records: HealthRecord[];
}) {
  const latestRecord = records[0];
  const previousRecord = records[1];
  const delta = latestRecord && previousRecord ? latestRecord.risk_score - previousRecord.risk_score : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr,1fr,1fr]">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Current diabetes risk</div>
            <CardTitle className="mt-2 font-[var(--font-display)] text-5xl">
              {latestPrediction ? `${Math.round(latestPrediction.risk_score)}%` : "--"}
            </CardTitle>
          </div>
          {latestPrediction ? <Badge variant={categoryVariant(latestPrediction.category)}>{latestPrediction.category} risk</Badge> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={latestPrediction?.risk_score ?? 0} />
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Model confidence</div>
            <div className="font-semibold">{latestPrediction ? `${Math.round(latestPrediction.confidence * 100)}%` : "--"}</div>
          </div>
        </CardContent>
      </Card>

      <MetricCard
        label="Trend vs previous"
        value={delta === null ? "No baseline" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pts`}
        description={delta === null ? "Generate at least two records to unlock trend analysis." : delta > 0 ? "Risk is moving upward." : "Risk is moving in the right direction."}
        icon={delta === null || delta <= 0 ? ArrowDownRight : ArrowUpRight}
        accent={delta === null || delta <= 0 ? "emerald" : "amber"}
      />

      <MetricCard
        label="Latest glucose"
        value={latestRecord?.glucose ? `${latestRecord.glucose} mg/dL` : "No lab data"}
        description={
          latestRecord?.glucose
            ? latestRecord.glucose < 140
              ? "Within the normal post-meal range."
              : "Worth reviewing with a clinician."
            : "Upload a report to add real lab values."
        }
        icon={latestRecord?.glucose && latestRecord.glucose > 140 ? TriangleAlert : ShieldCheck}
        accent={latestRecord?.glucose && latestRecord.glucose > 140 ? "rose" : "sky"}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof ShieldCheck;
  accent: "emerald" | "amber" | "rose" | "sky";
}) {
  const accentStyles = {
    emerald: "from-emerald-400/15 to-emerald-200/0 text-emerald-700 bg-emerald-50",
    amber: "from-amber-400/15 to-amber-200/0 text-amber-700 bg-amber-50",
    rose: "from-rose-400/15 to-rose-200/0 text-rose-700 bg-rose-50",
    sky: "from-sky-400/15 to-sky-200/0 text-sky-700 bg-sky-50",
  }[accent];

  return (
    <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.75))]">
      <CardContent className="pt-6">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${accentStyles}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-6 text-sm font-medium text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

