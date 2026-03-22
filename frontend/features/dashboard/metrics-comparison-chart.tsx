"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { HealthRecord } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/features/dashboard/chart-tooltip";

function metricColor(metric: string, value: number) {
  if (metric === "Glucose") {
    if (value < 140) return "#16a34a";
    if (value < 200) return "#f59e0b";
    return "#ef4444";
  }
  if (metric === "HbA1c") {
    if (value < 5.7) return "#16a34a";
    if (value < 6.5) return "#f59e0b";
    return "#ef4444";
  }
  if (value < 200) return "#16a34a";
  if (value < 240) return "#f59e0b";
  return "#ef4444";
}

export function MetricsComparisonChart({ latestRecord }: { latestRecord?: HealthRecord }) {
  const axisColor = "rgb(var(--chart-axis))";
  const cursorColor = "rgb(var(--chart-cursor) / 0.12)";

  const chartData = [
    { metric: "Glucose", value: latestRecord?.glucose ?? 0, unit: "mg/dL" },
    { metric: "HbA1c", value: latestRecord?.hba1c ?? 0, unit: "%" },
    { metric: "Cholesterol", value: latestRecord?.cholesterol ?? 0, unit: "mg/dL" },
  ].filter((entry) => entry.value > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Health zones</CardTitle>
        <CardDescription>
          Each metric is color-mapped to its expected healthy range.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[310px]">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <XAxis
                dataKey="metric"
                tickLine={false}
                axisLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 12 }} width={40} />
              <Tooltip
                cursor={{ fill: cursorColor }}
                content={<ChartTooltip formatter={(value) => String(value)} />}
              />
              <Bar dataKey="value" radius={[16, 16, 6, 6]} name="Value">
                {chartData.map((entry) => (
                  <Cell key={entry.metric} fill={metricColor(entry.metric, entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 text-center text-sm text-muted-foreground dark:border-white/14 dark:bg-white/6">
            Upload a blood report to unlock lab metric comparisons.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
