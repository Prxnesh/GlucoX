"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, LoaderCircle, Sigma, SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react";

import { fetchDashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DashboardSnapshot, HealthRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifestyleProfileForm } from "@/features/advanced/lifestyle-profile-form";

const initialSnapshot: DashboardSnapshot = {
  latest_prediction: null,
  records: [],
  reports: [],
};

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (!values.length) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function formatMetric(value: number, unit = "") {
  if (!Number.isFinite(value)) return "--";
  return `${value.toFixed(1)}${unit}`;
}

function topInsightPhrases(records: HealthRecord[]) {
  const counters = new Map<string, number>();

  records.forEach((record) => {
    record.insights.forEach((insight) => {
      const normalized = insight.trim();
      if (!normalized) return;
      counters.set(normalized, (counters.get(normalized) ?? 0) + 1);
    });
  });

  return [...counters.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([insight, count]) => ({ insight, count }));
}

export function AdvancedView() {
  const router = useRouter();
  const { ready, token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(initialSnapshot);

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboard(token);
      setSnapshot(data);
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Unable to load advanced analytics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }

    void loadDashboard();
  }, [ready, token, router, loadDashboard]);

  const analytics = useMemo(() => {
    const records = snapshot.records;
    const riskValues = records.map((record) => record.risk_score);
    const glucoseValues = records.map((record) => record.glucose).filter((value): value is number => value !== null);
    const lastFive = records.slice(0, 5).map((record) => record.risk_score);
    const oldestFive = [...records].slice(-5).map((record) => record.risk_score);

    const lastFiveMean = mean(lastFive);
    const oldestFiveMean = mean(oldestFive);
    const direction = lastFive.length && oldestFive.length ? lastFiveMean - oldestFiveMean : 0;

    const categoryCounts = {
      low: records.filter((record) => record.category === "low").length,
      medium: records.filter((record) => record.category === "medium").length,
      high: records.filter((record) => record.category === "high").length,
    };

    return {
      recordCount: records.length,
      riskMean: mean(riskValues),
      riskVolatility: standardDeviation(riskValues),
      glucoseMean: mean(glucoseValues),
      trendDirection: direction,
      categoryCounts,
      topInsights: topInsightPhrases(records),
    };
  }, [snapshot.records]);

  if (!ready || loading) {
    return (
      <div className="mx-auto flex min-h-[58vh] max-w-7xl items-center justify-center px-4 md:px-8">
        <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 shadow-[var(--shadow-card)] dark:bg-white/10">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Preparing advanced analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <section className="dashboard-grid overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/50 px-6 py-8 shadow-[var(--shadow-soft)] dark:border-white/12 dark:bg-white/6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Advanced workspace</div>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {user ? `${user.name.split(" ")[0]}'s Deep Health View` : "Deep Health View"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              Explore signal stability, trajectory shifts, and repeated insight patterns from your prediction timeline.
            </p>
          </div>
          <Badge variant="neutral">Beta analytics</Badge>
        </div>
      </section>

      {error ? <div className="mt-6 rounded-[1.5rem] bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:bg-rose-500/18 dark:text-rose-200">{error}</div> : null}

      <section className="mt-8">
        <LifestyleProfileForm />
      </section>

      {!snapshot.records.length ? (
        <section className="mt-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="mx-auto h-6 w-6 text-muted-foreground" />
              <h2 className="mt-3 font-[var(--font-display)] text-2xl font-semibold">No records for advanced analysis yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Run a few predictions in the dashboard and this page will unlock distribution and trend statistics.
              </p>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Sigma} label="Mean risk score" value={formatMetric(analytics.riskMean, "%")} />
            <StatCard icon={SlidersHorizontal} label="Risk volatility" value={formatMetric(analytics.riskVolatility, " pts")} />
            <StatCard icon={TrendingUp} label="5v5 trend delta" value={formatMetric(analytics.trendDirection, " pts")} />
            <StatCard icon={Activity} label="Mean glucose" value={formatMetric(analytics.glucoseMean, " mg/dL")} />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr,1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">Risk category distribution</CardTitle>
                <CardDescription>How often each risk band appears across all saved records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["low", "medium", "high"] as const).map((category) => {
                  const value = analytics.categoryCounts[category];
                  const percentage = Math.round((value / analytics.recordCount) * 100);

                  return (
                    <div key={category} className="rounded-[1.4rem] border border-white/65 bg-white/70 p-4 dark:border-white/12 dark:bg-white/6">
                      <div className="flex items-center justify-between">
                        <div className="capitalize font-medium">{category}</div>
                        <Badge variant={category === "high" ? "danger" : category === "medium" ? "warning" : "default"}>
                          {value} records
                        </Badge>
                      </div>
                      <div className="mt-3 h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/12">
                        <div
                          className="h-2.5 rounded-full bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#54c4ff_100%)]"
                          style={{ width: `${Math.max(percentage, 6)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">{percentage}% of total timeline</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-[var(--font-display)] text-2xl">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Most frequent insights
                </CardTitle>
                <CardDescription>Repeated guidance points extracted from prediction outputs.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topInsights.length ? (
                    analytics.topInsights.map((item) => (
                      <div key={item.insight} className="rounded-[1.4rem] border border-white/65 bg-white/70 p-4 dark:border-white/12 dark:bg-white/6">
                        <div className="text-sm leading-6 text-foreground">{item.insight}</div>
                        <div className="mt-2 text-xs text-muted-foreground">Mentioned {item.count} times</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm text-muted-foreground dark:border-white/12 dark:bg-white/6">
                      Insight frequency will appear once your records include generated recommendations.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">Recent advanced log</CardTitle>
                <CardDescription>Latest ten records with vital markers used in model evaluation.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="pb-3 pr-3">Risk</th>
                      <th className="pb-3 pr-3">Category</th>
                      <th className="pb-3 pr-3">Glucose</th>
                      <th className="pb-3 pr-3">HbA1c</th>
                      <th className="pb-3 pr-3">BMI</th>
                      <th className="pb-3 pr-3">Blood Pressure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.records.slice(0, 10).map((record) => (
                      <tr key={record.id} className="border-t border-white/70 dark:border-white/10">
                        <td className="py-3 pr-3 font-semibold">{record.risk_score.toFixed(1)}%</td>
                        <td className="py-3 pr-3">
                          <Badge variant={record.category === "high" ? "danger" : record.category === "medium" ? "warning" : "default"}>
                            {record.category}
                          </Badge>
                        </td>
                        <td className="py-3 pr-3">{record.glucose ?? "--"}</td>
                        <td className="py-3 pr-3">{record.hba1c ?? "--"}</td>
                        <td className="py-3 pr-3">{record.bmi ?? "--"}</td>
                        <td className="py-3 pr-3">{record.blood_pressure ?? "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-4 text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
