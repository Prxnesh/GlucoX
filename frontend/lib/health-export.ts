import type { DashboardSnapshot, User } from "@/lib/types";

function formatDate(value?: string | null) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMetric(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) {
    return "--";
  }

  return `${value}${suffix}`;
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildHealthSummary(user: User | null | undefined, snapshot: DashboardSnapshot) {
  const latestRecord = snapshot.records[0];
  const latestReport = snapshot.reports[0];
  const latestPrediction = snapshot.latest_prediction;

  const lines = [
    `Patient: ${user?.name ?? "Unknown user"}`,
    `Email: ${user?.email ?? "--"}`,
    `Latest risk score: ${latestPrediction ? `${Math.round(latestPrediction.risk_score)}% (${latestPrediction.category})` : "--"}`,
    `Risk confidence: ${latestPrediction ? `${Math.round(latestPrediction.confidence * 100)}%` : "--"}`,
    `Latest record date: ${formatDate(latestRecord?.recorded_at)}`,
    `Latest report date: ${formatDate(latestReport?.created_at)}`,
    `Total saved records: ${snapshot.records.length}`,
    `Total saved reports: ${snapshot.reports.length}`,
  ];

  if (latestRecord) {
    lines.push(
      `Latest record metrics: glucose ${formatMetric(latestRecord.glucose, " mg/dL")}, HbA1c ${formatMetric(latestRecord.hba1c, "%")}, cholesterol ${formatMetric(latestRecord.cholesterol, " mg/dL")}, BMI ${formatMetric(latestRecord.bmi)}, blood pressure ${formatMetric(latestRecord.blood_pressure)}, insulin ${formatMetric(latestRecord.insulin)}`
    );
  }

  if (latestPrediction?.insights?.length) {
    lines.push("Latest insights:");
    latestPrediction.insights.slice(0, 3).forEach((insight) => lines.push(`- ${insight}`));
  }

  return lines.join("\n");
}

export function buildHealthHistoryCsv(user: User | null | undefined, snapshot: DashboardSnapshot) {
  const rows = [
    [
      "type",
      "recorded_at",
      "risk_score",
      "category",
      "glucose",
      "hba1c",
      "cholesterol",
      "bmi",
      "blood_pressure",
      "insulin",
      "age",
      "insights",
    ],
  ];

  snapshot.records.forEach((record) => {
    rows.push([
      record.source,
      formatDate(record.recorded_at),
      Math.round(record.risk_score).toString(),
      record.category,
      record.glucose?.toString() ?? "",
      record.hba1c?.toString() ?? "",
      record.cholesterol?.toString() ?? "",
      record.bmi?.toString() ?? "",
      record.blood_pressure?.toString() ?? "",
      record.insulin?.toString() ?? "",
      record.age?.toString() ?? "",
      record.insights.join(" | "),
    ]);
  });

  snapshot.reports.forEach((report) => {
    rows.push([
      "report",
      formatDate(report.created_at),
      "",
      "",
      report.glucose?.toString() ?? "",
      report.hba1c?.toString() ?? "",
      report.cholesterol?.toString() ?? "",
      "",
      "",
      "",
      "",
      report.insights.join(" | "),
    ]);
  });

  const header = ["patient_name", "patient_email"];
  const meta = [user?.name ?? "", user?.email ?? ""];

  return [
    header.map(escapeCsv).join(","),
    meta.map(escapeCsv).join(","),
    "",
    rows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n"),
  ].join("\n");
}