"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrainCircuit, Droplet, Gauge, HeartHandshake, Ruler, Scale } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { predictRisk } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { PredictionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  age: z.coerce.number().min(10).max(120),
  bmi: z.coerce.number().min(10).max(70),
  glucose: z.coerce.number().min(40).max(500),
  blood_pressure: z.coerce.number().min(40).max(240),
  insulin: z.coerce.number().min(0).max(900),
  family_history: z.boolean(),
});

const fieldConfig = [
  { name: "age", label: "Age", placeholder: "34", icon: BrainCircuit },
  { name: "bmi", label: "BMI", placeholder: "27.1", icon: Scale },
  { name: "glucose", label: "Glucose", placeholder: "142", icon: Droplet },
  { name: "blood_pressure", label: "Blood pressure", placeholder: "84", icon: Gauge },
  { name: "insulin", label: "Insulin", placeholder: "94", icon: Ruler },
] as const;

const quickSamples = [
  {
    label: "Sample A - low",
    values: {
      age: 27,
      bmi: 22.3,
      glucose: 96,
      blood_pressure: 74,
      insulin: 72,
      family_history: false,
    },
  },
  {
    label: "Sample B - medium",
    values: {
      age: 42,
      bmi: 29.4,
      glucose: 148,
      blood_pressure: 88,
      insulin: 130,
      family_history: true,
    },
  },
  {
    label: "Sample C - high",
    values: {
      age: 55,
      bmi: 34.8,
      glucose: 212,
      blood_pressure: 102,
      insulin: 218,
      family_history: true,
    },
  },
] as const;

const defaultValues = {
  age: 36,
  bmi: 28.6,
  glucose: 134,
  blood_pressure: 82,
  insulin: 88,
  family_history: false,
} as const;

export function RiskAssessmentForm({
  onCreated,
}: {
  onCreated: (result: PredictionResult) => void;
}) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!token) {
      setError("Please log in to run a prediction.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await predictRisk(token, values);
        onCreated(result);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Prediction failed.");
      }
    });
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Risk predictor</CardTitle>
        <CardDescription>
          Use the current vitals you have on hand to generate a calibrated diabetes risk score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="rounded-[1.25rem] border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
            <p className="text-sm font-medium text-sky-800 dark:text-sky-200">Quick test samples</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickSamples.map((sample) => (
                <Button
                  key={sample.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    form.reset(sample.values);
                    setError(null);
                  }}
                >
                  {sample.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  form.reset(defaultValues);
                  setError(null);
                }}
              >
                Clear form
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fieldConfig.map((field) => {
              const Icon = field.icon;
              return (
                <label key={field.name} className="block space-y-2">
                  <span className="text-sm font-medium">{field.label}</span>
                  <div className="relative">
                    <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-11"
                      inputMode="decimal"
                      placeholder={field.placeholder}
                      {...form.register(field.name)}
                    />
                  </div>
                </label>
              );
            })}
          </div>

          <label className="flex items-start gap-3 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/14">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 dark:border-emerald-400/60 dark:bg-emerald-500/12"
              {...form.register("family_history")}
            />
            <div>
              <div className="flex items-center gap-2 font-medium">
                <HeartHandshake className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                Family history
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Include this if a close family member has been diagnosed with diabetes.
              </p>
            </div>
          </label>

          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/18 dark:text-rose-200">{error}</p> : null}

          <Button className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Running model..." : "Predict diabetes risk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

