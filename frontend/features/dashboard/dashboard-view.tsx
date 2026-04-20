"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

import { clearDashboardHistory, fetchDashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DashboardSnapshot, PredictionResult } from "@/lib/types";
import { AssistantLaunchCard } from "@/features/assistant/assistant-launch-card";
import { CareSummaryCard } from "@/features/dashboard/care-summary-card";
import { EmptyDashboard } from "@/features/dashboard/empty-dashboard";
import { InsightsPanel } from "@/features/dashboard/insights-panel";
import { MetricsComparisonChart } from "@/features/dashboard/metrics-comparison-chart";
import { OverviewCards } from "@/features/dashboard/overview-cards";
import { RiskDriversCard } from "@/features/dashboard/risk-drivers-card";
import { RiskHistoryChart } from "@/features/dashboard/risk-history-chart";
import { HistoryTimeline } from "@/features/history/history-timeline";
import { RiskAssessmentForm } from "@/features/predict/risk-assessment-form";
import { ReportUploader } from "@/features/reports/report-uploader";
import { RecentPredictionReport } from "@/features/reports/recent-prediction-report";

const initialSnapshot: DashboardSnapshot = {
  latest_prediction: null,
  records: [],
  reports: [],
};

export function DashboardView() {
  const router = useRouter();
  const { ready, token, user } = useAuth();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(initialSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboard(token);
      setSnapshot(data);
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : "Unable to load dashboard.");
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

  const handlePredictionCreated = (result: PredictionResult) => {
    setSnapshot((current) => ({ ...current, latest_prediction: result }));
    void loadDashboard();
  };

  const handleReportCreated = () => {
    void loadDashboard();
  };

  const handleClearHistory = async () => {
    if (!token || isClearing) {
      return;
    }

    const confirmed = window.confirm(
      "Clear all saved health history? This removes predictions and report entries for your account."
    );

    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      await clearDashboardHistory(token);
      setSnapshot(initialSnapshot);
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Unable to clear history.");
    } finally {
      setIsClearing(false);
    }
  };

  if (!ready || (loading && !snapshot.records.length && !snapshot.reports.length && !snapshot.latest_prediction)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 shadow-[var(--shadow-card)] dark:bg-white/10">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Preparing your dashboard...</span>
        </div>
      </div>
    );
  }

  const latestRecord = snapshot.records[0];
  const latestReport = snapshot.reports[0];
  const latestPredictionRecord = snapshot.records.find((record) => record.source === "prediction") ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <section className="dashboard-grid overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/50 px-6 py-8 shadow-[var(--shadow-soft)] dark:border-white/12 dark:bg-white/6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Personal health cockpit
            </div>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {user ? `Good to see you, ${user.name.split(" ")[0]}.` : "Your diabetes intelligence dashboard."}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Review your latest risk score, track lab shifts over time, and turn static reports into useful guidance.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-[var(--shadow-card)] transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/25 dark:bg-white/8 dark:text-rose-200 dark:hover:bg-rose-500/12"
            onClick={() => void handleClearHistory()}
            disabled={isClearing || loading}
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? "Clearing history..." : "Clear history"}
          </button>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-[1.75rem] bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:bg-rose-500/18 dark:text-rose-200">{error}</div>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
        <RiskAssessmentForm onCreated={handlePredictionCreated} />
        <ReportUploader onCreated={handleReportCreated} />
      </section>

      <section className="mt-8">
        <RecentPredictionReport
          user={user}
          latestPrediction={snapshot.latest_prediction}
          latestPredictionRecord={latestPredictionRecord}
        />
      </section>

      <section className="mt-8">
        <CareSummaryCard user={user} snapshot={snapshot} />
      </section>

      <section className="mt-8">
        <AssistantLaunchCard />
      </section>

      {snapshot.records.length ? (
        <>
          <section className="mt-8">
            <OverviewCards latestPrediction={snapshot.latest_prediction} records={snapshot.records} />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
            <RiskHistoryChart records={snapshot.records} />
            <MetricsComparisonChart latestRecord={latestRecord} />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr,1fr,1.15fr]">
            <RiskDriversCard prediction={snapshot.latest_prediction} />
            <InsightsPanel prediction={snapshot.latest_prediction} latestReport={latestReport} />
            <HistoryTimeline records={snapshot.records} />
          </section>
        </>
      ) : (
        <section className="mt-8">
          <EmptyDashboard />
        </section>
      )}
    </div>
  );
}
