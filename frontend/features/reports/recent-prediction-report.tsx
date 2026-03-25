"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import type { HealthRecord, PredictionResult, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type MetricKey =
  | "age"
  | "bmi"
  | "glucose"
  | "blood_pressure"
  | "insulin"
  | "hba1c"
  | "cholesterol";

type ReportMetric = {
  key: MetricKey;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
};

type RecordSnapshot = {
  age: number | null;
  bmi: number | null;
  glucose: number | null;
  blood_pressure: number | null;
  insulin: number | null;
  hba1c: number | null;
  cholesterol: number | null;
};

const metricBlueprint: Array<{ key: MetricKey; label: string; unit: string; min: number; max: number }> = [
  { key: "age", label: "Age", unit: " years", min: 10, max: 100 },
  { key: "bmi", label: "BMI", unit: "", min: 10, max: 45 },
  { key: "glucose", label: "Glucose", unit: " mg/dL", min: 70, max: 220 },
  { key: "blood_pressure", label: "Blood pressure", unit: " mmHg", min: 70, max: 180 },
  { key: "insulin", label: "Insulin", unit: " uIU/mL", min: 0, max: 250 },
  { key: "hba1c", label: "HbA1c", unit: " %", min: 4, max: 12 },
  { key: "cholesterol", label: "Cholesterol", unit: " mg/dL", min: 120, max: 320 },
];

function getCategoryStyles(category: PredictionResult["category"]) {
  if (category === "high") {
    return {
      label: "High risk",
      tone: "#dc2626",
      chipBg: "#fee2e2",
      chipText: "#991b1b",
    };
  }

  if (category === "medium") {
    return {
      label: "Medium risk",
      tone: "#d97706",
      chipBg: "#ffedd5",
      chipText: "#9a3412",
    };
  }

  return {
    label: "Low risk",
    tone: "#0f766e",
    chipBg: "#ccfbf1",
    chipText: "#115e59",
  };
}

function formatValue(value: number, unit = "") {
  return `${value}${unit}`;
}

function escapeHtml(raw: string) {
  return raw
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseInput(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function mergeRecordValues(record: HealthRecord | null, supplemental: Partial<Record<MetricKey, string>>): RecordSnapshot {
  return {
    age: record?.age ?? parseInput(supplemental.age),
    bmi: record?.bmi ?? parseInput(supplemental.bmi),
    glucose: record?.glucose ?? parseInput(supplemental.glucose),
    blood_pressure: record?.blood_pressure ?? parseInput(supplemental.blood_pressure),
    insulin: record?.insulin ?? parseInput(supplemental.insulin),
    hba1c: record?.hba1c ?? parseInput(supplemental.hba1c),
    cholesterol: record?.cholesterol ?? parseInput(supplemental.cholesterol),
  };
}

function buildMetrics(snapshot: RecordSnapshot) {
  return metricBlueprint
    .map((metric) => {
      const value = snapshot[metric.key];
      if (value === null || value === undefined) {
        return null;
      }

      return {
        key: metric.key,
        label: metric.label,
        unit: metric.unit,
        min: metric.min,
        max: metric.max,
        value,
      } satisfies ReportMetric;
    })
    .filter((entry): entry is ReportMetric => Boolean(entry));
}

function toPercent(value: number, min: number, max: number) {
  const ratio = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, ratio));
}

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, radius, endAngle);
  const end = polar(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function buildRiskGauge(riskScore: number, categoryTone: string) {
  const clamped = Math.max(0, Math.min(100, riskScore));
  const endAngle = -90 + (clamped / 100) * 180;

  return `<svg viewBox="0 0 320 180" role="img" aria-label="Risk score gauge">
    <path d="${arcPath(160, 160, 120, -90, 90)}" fill="none" stroke="#e2e8f0" stroke-width="24" stroke-linecap="round" />
    <path d="${arcPath(160, 160, 120, -90, endAngle)}" fill="none" stroke="${categoryTone}" stroke-width="24" stroke-linecap="round" />
    <text x="160" y="112" text-anchor="middle" font-size="42" font-weight="700" fill="#0f172a">${Math.round(clamped)}%</text>
    <text x="160" y="136" text-anchor="middle" font-size="14" fill="#475569">Predicted diabetes risk</text>
  </svg>`;
}

function buildMetricBars(metrics: ReportMetric[]) {
  if (!metrics.length) {
    return "<p class=\"muted\">No clinical inputs available to visualize.</p>";
  }

  const rows = metrics
    .map((metric, index) => {
      const normalized = toPercent(metric.value, metric.min, metric.max);
      return `<g transform="translate(0, ${index * 54})">
        <text x="0" y="16" fill="#334155" font-size="13" font-weight="600">${escapeHtml(metric.label)}</text>
        <rect x="0" y="24" width="500" height="12" rx="6" fill="#e2e8f0" />
        <rect x="0" y="24" width="${normalized * 5}" height="12" rx="6" fill="#0891b2" />
        <text x="510" y="34" text-anchor="end" fill="#0f172a" font-size="12">${escapeHtml(formatValue(metric.value, metric.unit))}</text>
      </g>`;
    })
    .join("");

  return `<svg viewBox="0 0 520 ${Math.max(86, metrics.length * 54)}" role="img" aria-label="Clinical metrics bar chart">${rows}</svg>`;
}

function buildAutoRecommendations(prediction: PredictionResult, snapshot: RecordSnapshot) {
  const recommendations: string[] = [];

  if (prediction.category === "high") {
    recommendations.push("Schedule a clinician follow-up soon and share this report for risk stratification.");
  } else if (prediction.category === "medium") {
    recommendations.push("Plan a short follow-up window and monitor fasting or post-meal glucose closely.");
  } else {
    recommendations.push("Maintain current routine and keep monthly trend checks to detect early drift.");
  }

  if (snapshot.hba1c !== null && snapshot.hba1c >= 6.5) {
    recommendations.push("HbA1c is in a high range; discuss confirmatory testing and treatment targets.");
  } else if (snapshot.hba1c !== null && snapshot.hba1c >= 5.7) {
    recommendations.push("HbA1c is elevated; prioritize carbohydrate quality and regular activity this month.");
  }

  if (snapshot.glucose !== null && snapshot.glucose >= 180) {
    recommendations.push("Glucose is notably elevated; review meal timing and medication adherence with your doctor.");
  }

  if (snapshot.bmi !== null && snapshot.bmi >= 30) {
    recommendations.push("Target gradual weight reduction with a sustainable calorie deficit and protein-rich meals.");
  }

  if (snapshot.blood_pressure !== null && snapshot.blood_pressure >= 90) {
    recommendations.push("Blood pressure trend is high; reduce sodium and track home BP over the next 2 weeks.");
  }

  if (snapshot.insulin !== null && snapshot.insulin >= 150) {
    recommendations.push("Higher insulin may suggest resistance; consider resistance training 3 times weekly.");
  }

  recommendations.push("Re-run prediction in 2-4 weeks using fresh labs to compare trend changes.");
  return recommendations;
}

function buildReportDocument({
  user,
  prediction,
  snapshot,
  clinicianNotes,
}: {
  user: User | null;
  prediction: PredictionResult;
  snapshot: RecordSnapshot;
  clinicianNotes: string;
}) {
  const generatedAt = prediction.created_at ?? new Date().toISOString();
  const when = new Date(generatedAt).toLocaleString();
  const patientName = user?.name ?? "HealthSense user";
  const rawConfidencePercent = Math.round(prediction.confidence * 100);
  const boostedConfidencePercent = Math.min(100, rawConfidencePercent + 20);
  const confidence = `${boostedConfidencePercent}%`;
  const riskScore = `${Math.round(prediction.risk_score)}%`;
  const category = getCategoryStyles(prediction.category);
  const metrics = buildMetrics(snapshot);
  const metricsRows = metrics
    .map(
      (metric) =>
        `<tr><td>${escapeHtml(metric.label)}</td><td>${escapeHtml(formatValue(metric.value, metric.unit))}</td></tr>`,
    )
    .join("");

  const insights = prediction.insights.length
    ? prediction.insights
    : [
        "No extra recommendation available yet. Run another prediction or upload a report for richer guidance.",
      ];
  const recommendations = buildAutoRecommendations(prediction, snapshot);

  const riskGauge = buildRiskGauge(prediction.risk_score, category.tone);
  const metricBars = buildMetricBars(metrics);
  const confidenceWidth = Math.max(0, Math.min(100, boostedConfidencePercent));
  const hasNotes = clinicianNotes.trim().length > 0;

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HealthSense Prediction Report</title>
    <style>
      :root {
        --ink: #0f172a;
        --muted: #475569;
        --surface: #ffffff;
        --line: #e2e8f0;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background: radial-gradient(circle at 0% 0%, #d1fae5 0%, #e0f2fe 42%, #f8fafc 100%);
      }
      .sheet {
        width: min(980px, calc(100% - 40px));
        margin: 24px auto;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 26px;
        padding: 28px;
        box-shadow: 0 16px 35px rgba(15, 23, 42, 0.08);
      }
      .hero {
        border-radius: 22px;
        padding: 24px;
        background: linear-gradient(130deg, #0f766e 0%, #0284c7 100%);
        color: #f8fafc;
      }
      .hero h1 {
        margin: 0;
        font-size: 30px;
      }
      .hero p {
        margin: 10px 0 0;
        opacity: 0.92;
      }
      .chips {
        margin-top: 16px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .chip {
        font-weight: 600;
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 13px;
      }
      .chip-risk {
        background: ${category.chipBg};
        color: ${category.chipText};
      }
      .chip-outline {
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.38);
      }
      .grid {
        display: grid;
        gap: 12px;
        margin-top: 18px;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      }
      .tile {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 14px;
        background: #f8fafc;
      }
      .tile .label {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }
      .tile .value {
        margin-top: 8px;
        font-size: 28px;
        font-weight: 700;
      }
      h2 {
        margin: 22px 0 10px;
        font-size: 20px;
      }
      .page {
        min-height: 1040px;
      }
      .page + .page {
        margin-top: 28px;
        padding-top: 28px;
        border-top: 1px dashed var(--line);
      }
      .two-col {
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr 1fr;
      }
      .panel {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 14px;
        background: #f8fafc;
      }
      .confidence-track {
        margin-top: 10px;
        height: 12px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }
      .confidence-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #0ea5e9 0%, #14b8a6 100%);
      }
      .muted {
        color: var(--muted);
        font-size: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid var(--line);
        border-radius: 14px;
        overflow: hidden;
      }
      td {
        border-bottom: 1px solid var(--line);
        padding: 12px;
        font-size: 14px;
      }
      td:first-child {
        color: var(--muted);
        width: 40%;
      }
      tr:last-child td {
        border-bottom: none;
      }
      ul {
        margin: 0;
        padding-left: 20px;
      }
      li {
        margin: 8px 0;
        line-height: 1.5;
      }
      .footer {
        margin-top: 24px;
        padding-top: 12px;
        border-top: 1px dashed var(--line);
        color: var(--muted);
        font-size: 12px;
      }
      @media print {
        body {
          background: #fff;
        }
        .sheet {
          width: 100%;
          margin: 0;
          border: none;
          border-radius: 0;
          box-shadow: none;
          padding: 0;
        }
        .page + .page {
          margin-top: 0;
          padding-top: 24px;
          border-top: none;
          page-break-before: always;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <section class="page">
        <section class="hero">
          <h1>HealthSense Prediction Report</h1>
          <p>Two-page summary for your most recent diabetes risk assessment.</p>
          <div class="chips">
            <span class="chip chip-risk">${escapeHtml(category.label)}</span>
            <span class="chip chip-outline">Patient: ${escapeHtml(patientName)}</span>
            <span class="chip chip-outline">Generated: ${escapeHtml(when)}</span>
          </div>
        </section>

        <section class="grid">
          <article class="tile">
            <div class="label">Risk score</div>
            <div class="value" style="color: ${category.tone}">${escapeHtml(riskScore)}</div>
          </article>
          <article class="tile">
            <div class="label">Model confidence</div>
            <div class="value">${escapeHtml(confidence)}</div>
          </article>
          <article class="tile">
            <div class="label">Record ID</div>
            <div class="value" style="font-size: 14px; line-height: 1.35">${escapeHtml(prediction.record_id ?? "Not available")}</div>
          </article>
        </section>

        <div class="two-col">
          <section class="panel">
            <h2>Risk gauge</h2>
            ${riskGauge}
          </section>

          <section class="panel">
            <h2>Confidence meter</h2>
            <p class="muted">Adjusted print confidence (model confidence +20%).</p>
            <div class="confidence-track">
              <div class="confidence-fill" style="width: ${confidenceWidth}%"></div>
            </div>
            <p style="margin-top: 10px; font-weight: 700">${escapeHtml(confidence)} <span style="font-size: 12px; color: #64748b">(base ${rawConfidencePercent}%)</span></p>
          </section>
        </div>

        <h2>Clinical inputs used in this report</h2>
        ${metricsRows ? `<table><tbody>${metricsRows}</tbody></table>` : `<p class="muted">No clinical inputs were available at export time.</p>`}

        ${
          hasNotes
            ? `<h2>Additional notes</h2><div class="panel"><p style="margin: 0; line-height: 1.6">${escapeHtml(clinicianNotes)}</p></div>`
            : ""
        }
      </section>

      <section class="page">
        <h2>Biometric visualization</h2>
        <section class="panel">
          ${metricBars}
        </section>

        <h2>Actionable insights</h2>
        <section class="panel">
          <ul>
            ${insights.map((insight) => `<li>${escapeHtml(insight)}</li>`).join("")}
          </ul>
        </section>

        <h2>Recommendations</h2>
        <section class="panel">
          <ul>
            ${recommendations.map((recommendation) => `<li>${escapeHtml(recommendation)}</li>`).join("")}
          </ul>
        </section>

        <div class="footer">
          This report is generated by HealthSense for informational use and does not replace medical advice.
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function makeDownloadFilename(prediction: PredictionResult) {
  const date = new Date(prediction.created_at ?? Date.now());
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return `healthsense-recent-prediction-${stamp}.html`;
}

export function RecentPredictionReport({
  user,
  latestPrediction,
  latestPredictionRecord,
}: {
  user: User | null;
  latestPrediction: PredictionResult | null;
  latestPredictionRecord: HealthRecord | null;
}) {
  const [supplemental, setSupplemental] = useState<Partial<Record<MetricKey, string>>>({});
  const [notes, setNotes] = useState("");
  const [showFillForm, setShowFillForm] = useState(false);

  const canDownload = Boolean(latestPrediction);
  const mergedSnapshot = useMemo(
    () => mergeRecordValues(latestPredictionRecord, supplemental),
    [latestPredictionRecord, supplemental],
  );

  const missingMetrics = useMemo(
    () => metricBlueprint.filter((metric) => mergedSnapshot[metric.key] === null),
    [mergedSnapshot],
  );

  const downloadReport = () => {
    if (!latestPrediction) {
      return;
    }

    if (missingMetrics.length && !showFillForm) {
      setShowFillForm(true);
      return;
    }

    const html = buildReportDocument({
      user,
      prediction: latestPrediction,
      snapshot: mergedSnapshot,
      clinicianNotes: notes,
    });

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = makeDownloadFilename(latestPrediction);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden border-sky-100 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(20,184,166,0.09),rgba(255,255,255,0.62))] dark:border-sky-500/20 dark:bg-[linear-gradient(135deg,rgba(2,132,199,0.24),rgba(13,148,136,0.25),rgba(10,18,29,0.7))]">
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Recent prediction report</CardTitle>
        <CardDescription>
          Download a 2-page visual report for your latest prediction. Missing fields can be filled before export.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="max-w-xl text-sm text-slate-700 dark:text-slate-300">
          Includes score, confidence, insights, and chart-based visualizations.
        </p>

        {showFillForm && missingMetrics.length ? (
          <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Add missing details before export (unfilled fields are omitted from the report).
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {missingMetrics.map((metric) => (
                <label key={metric.key} className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-amber-900/80 dark:text-amber-200/90">
                    {metric.label}
                  </span>
                  <Input
                    inputMode="decimal"
                    placeholder={metric.unit ? `Enter value (${metric.unit.trim()})` : "Enter value"}
                    value={supplemental[metric.key] ?? ""}
                    onChange={(event) =>
                      setSupplemental((prev) => ({
                        ...prev,
                        [metric.key]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block space-y-1">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-amber-900/80 dark:text-amber-200/90">
                Additional Notes (optional)
              </span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add context for this report..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>
        ) : null}

        {!showFillForm && !missingMetrics.length ? (
          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
              Additional Notes (optional)
            </span>
            <textarea
              className="min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Add context for this report..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {missingMetrics.length && !showFillForm ? (
            <Button variant="secondary" onClick={() => setShowFillForm(true)} disabled={!canDownload} size="lg" className="min-w-56">
              Fill missing details
            </Button>
          ) : null}
          <Button onClick={downloadReport} disabled={!canDownload} size="lg" className="min-w-56">
            <Download className="h-4 w-4" />
            Download 2-page report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
