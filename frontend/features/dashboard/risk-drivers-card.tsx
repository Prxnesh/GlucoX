import { Activity, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import type { PredictionResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatContribution(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} pts`;
}

function directionLabel(direction: "up" | "down" | "neutral") {
  if (direction === "up") {
    return "Pushing risk up";
  }
  if (direction === "down") {
    return "Pulling risk down";
  }
  return "Neutral impact";
}

function DirectionIcon({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "up") {
    return <ArrowUpRight className="h-4 w-4 text-rose-500" />;
  }
  if (direction === "down") {
    return <ArrowDownRight className="h-4 w-4 text-emerald-500" />;
  }
  return <Minus className="h-4 w-4 text-slate-400" />;
}

export function RiskDriversCard({ prediction }: { prediction: PredictionResult | null }) {
  const drivers = prediction?.drivers ?? [];
  const maxMagnitude = Math.max(...drivers.map((driver) => Math.abs(driver.contribution)), 1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-[var(--font-display)] text-2xl">
          <Activity className="h-5 w-5 text-sky-500" />
          Why your score moved
        </CardTitle>
        <CardDescription>
          Top model drivers from your latest prediction. Positive values increase risk and negative values lower it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {drivers.length ? (
          <div className="space-y-3">
            {drivers.map((driver) => {
              const width = `${Math.max((Math.abs(driver.contribution) / maxMagnitude) * 100, 8)}%`;

              return (
                <div key={driver.feature} className="rounded-[1.5rem] border border-white/65 bg-white/75 p-4 dark:border-white/12 dark:bg-white/6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{driver.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{driver.detail}</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <DirectionIcon direction={driver.direction} />
                      {formatContribution(driver.contribution)}
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className={
                        driver.direction === "up"
                          ? "h-2 rounded-full bg-rose-400"
                          : driver.direction === "down"
                            ? "h-2 rounded-full bg-emerald-400"
                            : "h-2 rounded-full bg-slate-400"
                      }
                      style={{ width }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{directionLabel(driver.direction)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-muted-foreground dark:border-white/14 dark:bg-white/6">
            Run a prediction to see feature-level drivers here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}