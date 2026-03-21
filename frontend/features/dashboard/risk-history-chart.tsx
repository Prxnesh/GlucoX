"use client";

import { format } from "date-fns";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { HealthRecord } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/features/dashboard/chart-tooltip";

export function RiskHistoryChart({ records }: { records: HealthRecord[] }) {
  const chartData = [...records]
    .reverse()
    .map((record) => ({
      date: format(new Date(record.recorded_at), "MMM d"),
      glucose: record.glucose ?? null,
      risk: Math.round(record.risk_score),
    }))
    .filter((entry) => entry.glucose !== null || entry.risk !== null);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Glucose trend</CardTitle>
        <CardDescription>
          Watch changes over time and compare glucose readings against model risk.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[310px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="riskStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#0cc9a7" />
                <stop offset="100%" stopColor="#5ab0ff" />
              </linearGradient>
              <linearGradient id="glucoseStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#f8b84b" />
                <stop offset="100%" stopColor="#ff7d7d" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#557086", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#557086", fontSize: 12 }}
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#557086", fontSize: 12 }}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "rgba(72, 123, 156, 0.18)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
              content={
                <ChartTooltip
                  formatter={(value, name) =>
                    name === "Risk score" ? `${value}%` : `${value} mg/dL`
                  }
                />
              }
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="glucose"
              stroke="url(#glucoseStroke)"
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#ff8e5c" }}
              name="Glucose"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="risk"
              stroke="url(#riskStroke)"
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#0cc9a7" }}
              name="Risk score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

