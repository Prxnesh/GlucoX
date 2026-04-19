"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Stethoscope, Waves } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AssistantLaunchCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr,0.8fr] md:items-center">
        <div>
          <Badge variant="neutral">New in GlucoX</Badge>
          <h2 className="mt-4 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-balance">
            Ask your health assistant what your numbers might mean.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            The new assistant uses your saved predictions, OCR reports, and lifestyle profile to answer personalized questions in plain language, powered by a local Ollama model.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Why has my risk changed over time?",
              "What does this HbA1c trend suggest?",
              "Which habits look most worth improving first?",
            ].map((item) => (
              <div
                key={item}
                className="rounded-full border border-sky-100 bg-sky-50/70 px-4 py-2 text-xs font-medium text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/12 dark:text-sky-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,248,255,0.88))] p-5 shadow-[0_24px_54px_rgba(71,112,146,0.12)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(17,27,39,0.9),rgba(14,23,33,0.82))]">
          <div className="grid gap-3">
            {[
              { icon: Sparkles, label: "Personalized replies", value: "Grounded in your saved history" },
              { icon: Stethoscope, label: "Health-safe tone", value: "Clear guidance without overclaiming" },
              { icon: Waves, label: "Local model", value: "Runs through Ollama on your machine" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.35rem] bg-white/80 p-4 dark:bg-white/6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button asChild className="mt-5 w-full" size="lg">
            <Link href="/assistant">
              Open health assistant
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
