import { ActivitySquare } from "lucide-react";

export function EmptyDashboard() {
  return (
    <div className="rounded-[2rem] border border-dashed border-sky-200 bg-white/65 px-6 py-12 text-center shadow-[var(--shadow-card)] dark:border-sky-500/35 dark:bg-white/8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-sky-50 text-sky-700 dark:bg-sky-500/16 dark:text-sky-200">
        <ActivitySquare className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-[var(--font-display)] text-2xl font-semibold">No health records yet</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Start with a quick risk prediction or upload a recent lab report to generate your first snapshot.
      </p>
    </div>
  );
}

