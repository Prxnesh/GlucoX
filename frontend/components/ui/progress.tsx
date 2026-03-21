"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

export function Progress({
  className,
  value,
}: {
  className?: string;
  value: number;
}) {
  return (
    <ProgressPrimitive.Root
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-slate-100", className)}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#54c4ff_100%)] transition-transform"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

