"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Use a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Tell us how you’d like to be addressed."),
});

type AuthMode = "login" | "signup";

type Props = {
  mode: AuthMode;
};

type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schema = mode === "login" ? loginSchema : signupSchema;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "login") {
          await login(values.email, values.password);
        } else {
          await signup(values.name ?? "", values.email, values.password);
        }
        router.push("/dashboard");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
      }
    });
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#0cc9a7_0%,#5ab0ff_100%)] text-white shadow-[0_18px_32px_rgba(11,174,150,0.28)]">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="font-[var(--font-display)] text-3xl">
            {mode === "login" ? "Welcome back" : "Create your GlucoX account"}
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Continue where you left off and review your latest health signals."
              : "Secure your health history, report analyses, and predictive insights in one place."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Full name</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-11" placeholder="Priya Menon" {...form.register("name")} />
              </div>
              <FieldError message={form.formState.errors.name?.message} />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium">Email address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-11" placeholder="you@glucox.app" {...form.register("email")} />
            </div>
            <FieldError message={form.formState.errors.email?.message} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-11" type="password" placeholder="At least 8 characters" {...form.register("password")} />
            </div>
            <FieldError message={form.formState.errors.password?.message} />
          </label>

          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/18 dark:text-rose-200">{error}</p> : null}

          <Button className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Securing your session..." : mode === "login" ? "Log in" : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "New to GlucoX?" : "Already have an account?"}{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" href={mode === "login" ? "/signup" : "/login"}>
              {mode === "login" ? "Create one" : "Log in"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message}</p>;
}
