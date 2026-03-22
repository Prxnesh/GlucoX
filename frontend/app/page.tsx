"use client";

import Link from "next/link";
import { ArrowRight, Brain, FileScan, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" },
};

export default function HomePage() {
  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-10 md:px-8 xl:grid-cols-[1.12fr,0.88fr] xl:items-center">
        <motion.div {...fadeUp}>
          <div className="inline-flex rounded-full border border-emerald-100 bg-emerald-50/90 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200">
            Predict risk. Read reports. Track every signal.
          </div>
          <h1 className="mt-6 max-w-3xl font-[var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight text-balance md:text-7xl">
            Diabetes insights that feel calm, clear, and actually useful.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            GlucoX combines machine learning, OCR-powered report extraction, and a premium dashboard so people can understand metabolic health without decoding spreadsheets or lab jargon.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Start tracking
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: "90 sec", label: "to upload and parse a report" },
              { value: "3 views", label: "for risk, labs, and trend history" },
              { value: "1 flow", label: "from raw data to next-step guidance" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] bg-white/70 px-5 py-5 shadow-[var(--shadow-card)] dark:bg-white/6">
                <div className="font-[var(--font-display)] text-3xl font-semibold">{item.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="relative">
          <div className="absolute -left-6 top-12 h-32 w-32 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-600/28" />
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-600/26" />
          <Card className="relative overflow-hidden rounded-[2.5rem] p-2">
            <CardContent className="grid gap-4 p-4">
              <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f766e_0%,#38bdf8_100%)] p-6 text-white">
                <div className="text-sm text-white/80">Current diabetes risk</div>
                <div className="mt-3 font-[var(--font-display)] text-6xl font-semibold">34%</div>
                <div className="mt-4 inline-flex rounded-full bg-white/18 px-3 py-1 text-sm">Low risk trend</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { icon: FileScan, label: "OCR report sync", value: "HbA1c 5.8%" },
                  { icon: TrendingUp, label: "Glucose trend", value: "Stable 7-day line" },
                  { icon: Brain, label: "ML engine", value: "Logistic model v1" },
                  { icon: ShieldCheck, label: "Health insight", value: "Gentle intervention advice" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.6rem] bg-white/80 p-5 shadow-[0_14px_30px_rgba(80,122,149,0.08)] dark:bg-white/8 dark:shadow-[0_14px_30px_rgba(2,10,19,0.46)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 dark:bg-white/12 dark:text-slate-200">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">{item.label}</div>
                    <div className="mt-1 font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Predict with confidence",
              body: "A lightweight scikit-learn pipeline returns a normalized risk score and saves each result to your health history.",
            },
            {
              title: "Read reports instantly",
              body: "OCR and regex extraction pull the metrics that matter most from PDFs and blood test screenshots.",
            },
            {
              title: "Turn numbers into next steps",
              body: "Rule-based insights explain what a high HbA1c or elevated glucose value could mean in everyday language.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <h2 className="font-[var(--font-display)] text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
