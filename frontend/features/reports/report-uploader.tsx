"use client";

import { useRef, useState, useTransition } from "react";
import { FileUp, LoaderCircle, ScanSearch } from "lucide-react";

import { analyzeReport } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ReportExtraction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportUploader({
  onCreated,
}: {
  onCreated: (result: ReportExtraction) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!token) {
      setError("Please log in to upload a report.");
      return;
    }

    if (!selectedFile) {
      setError("Choose a PDF or image before starting the analysis.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const report = await analyzeReport(token, selectedFile);
        onCreated(report);
        setSelectedFile(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Unable to process the report.");
      }
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Report analyzer</CardTitle>
        <CardDescription>
          Upload a PDF or lab image and DiaSense will extract glucose, HbA1c, and cholesterol.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <button
          className="group flex w-full flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-sky-200 bg-sky-50/65 px-6 py-10 text-center transition-colors hover:border-sky-300 hover:bg-sky-50"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white shadow-sm">
            <ScanSearch className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Drop in a report or browse files</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports `.pdf`, `.png`, `.jpg`, and `.jpeg`
            </p>
          </div>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
        </button>

        <div className="rounded-[1.5rem] bg-white/70 px-4 py-4">
          {selectedFile ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <FileUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{selectedFile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSubmit} disabled={isPending}>
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Analyze"}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No report selected yet.</div>
          )}
        </div>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

