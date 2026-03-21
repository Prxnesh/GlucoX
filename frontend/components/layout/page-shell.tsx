"use client";

import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-[10%] top-[22%] h-52 w-52 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-[8%] left-[26%] h-56 w-56 rounded-full bg-teal-100/40 blur-3xl" />
      </div>
      <SiteHeader />
      <main className="relative z-10 pb-12">{children}</main>
    </div>
  );
}
