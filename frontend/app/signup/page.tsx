import { PageShell } from "@/components/layout/page-shell";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignupPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
          <div className="max-w-xl">
            <div className="rounded-full border border-emerald-100 bg-emerald-50/80 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200">
              Personal health workspace
            </div>
            <h1 className="mt-6 font-[var(--font-display)] text-5xl font-semibold tracking-tight text-balance">
              Start a cleaner, calmer way to monitor diabetes risk.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Create your account to store health records over time, compare report metrics, and spot shifts early.
            </p>
          </div>
          <AuthForm mode="signup" />
        </div>
      </div>
    </PageShell>
  );
}

