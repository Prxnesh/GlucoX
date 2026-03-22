"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

export function Avatar({
  className,
  children,
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full", className)}
    >
      {children}
    </AvatarPrimitive.Root>
  );
}

export function AvatarImage(props: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className="aspect-square h-full w-full" {...props} />;
}

export function AvatarFallback(props: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className="flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0fbf9f_0%,#58b0ff_100%)] text-sm font-semibold text-white shadow-[0_10px_22px_rgba(8,78,103,0.3)]"
      {...props}
    />
  );
}

