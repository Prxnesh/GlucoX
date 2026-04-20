"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";

import type { DashboardSnapshot, User } from "@/lib/types";
import { buildHealthHistoryCsv, buildHealthSummary } from "@/lib/health-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function CareSummaryCard({
  user,
  snapshot,
}: {
  user: User | null | undefined;
  snapshot: DashboardSnapshot;
}) {
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => buildHealthSummary(user, snapshot), [snapshot, user]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleDownloadCsv = () => {
    const fileName = `glucox-history-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadTextFile(fileName, buildHealthHistoryCsv(user, snapshot), "text/csv");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>GlucoX health summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            h1 { font-size: 28px; margin-bottom: 12px; }
            pre { white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; line-height: 1.65; }
          </style>
        </head>
        <body>
          <h1>GlucoX health summary</h1>
          <pre>${escapeHtml(summary)}</pre>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <Card className="overflow-hidden border-sky-100 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(20,184,166,0.08),rgba(255,255,255,0.58))] dark:border-sky-500/20 dark:bg-[linear-gradient(135deg,rgba(2,132,199,0.24),rgba(13,148,136,0.24),rgba(10,18,29,0.68))]">
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Care summary</CardTitle>
        <CardDescription>
          Export a clinician-friendly view of your latest risk score and saved history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-300">
          This summary combines your latest prediction, saved records, and OCR report history into a format you can copy, print, or export as CSV.
        </p>

        <div className="grid gap-3 rounded-[1.4rem] border border-white/70 bg-white/74 p-4 text-sm dark:border-white/12 dark:bg-white/6 lg:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Saved records</div>
            <div className="mt-2 text-lg font-semibold">{snapshot.records.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Saved reports</div>
            <div className="mt-2 text-lg font-semibold">{snapshot.reports.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest risk</div>
            <div className="mt-2 text-lg font-semibold">
              {snapshot.latest_prediction ? `${Math.round(snapshot.latest_prediction.risk_score)}%` : "--"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => void handleCopy()}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy summary"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleDownloadCsv}>
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
          <Button type="button" variant="ghost" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print / share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}