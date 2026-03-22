import { cn } from "@/lib/utils";

type PayloadEntry = {
  color?: string;
  dataKey?: string;
  name?: string;
  value?: number | string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
  formatter?: (value: number | string | undefined, name: string | undefined) => string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[1.25rem] border border-white/65 bg-white/92 p-4 shadow-[0_20px_40px_rgba(44,84,112,0.14)] dark:border-white/12 dark:bg-slate-900/92 dark:shadow-[0_22px_48px_rgba(0,0,0,0.46)]">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={`${entry.name}-${entry.dataKey}`} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full")} style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-semibold text-foreground">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

