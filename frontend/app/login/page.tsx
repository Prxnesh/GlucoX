import { PageShell } from "@/components/layout/page-shell";
import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
          <div className="max-w-xl">
            <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm font-medium text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/18 dark:text-sky-200">
              Secure session access
            </div>
            <h1 className="mt-6 font-[var(--font-display)] text-5xl font-semibold tracking-tight text-balance">
              Pick up your health story exactly where you left it.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Your dashboard keeps every prediction, lab sync, and insight in one uninterrupted timeline.
            </p>
          </div>
          <AuthForm mode="login" />
        </div>
      </div>
    </PageShell>
  );
}

