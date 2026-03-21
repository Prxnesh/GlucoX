"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, HeartPulse } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 px-4 py-4 md:px-8">
      <div className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/65 px-5 py-4 shadow-[var(--shadow-soft)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0cc9a7_0%,#5ab0ff_100%)] text-white shadow-[0_16px_30px_rgba(10,175,149,0.28)]">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <div className="font-[var(--font-display)] text-lg font-semibold tracking-tight">DiaSense</div>
            <div className="text-xs text-muted-foreground">Diabetes risk intelligence</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full bg-white/65 p-1 md:flex">
          {[
            { href: "/", label: "Product" },
            { href: "/dashboard", label: "Dashboard" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname === item.href ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right md:block">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <Avatar>
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href={isDashboard ? "/signup" : "/dashboard"}>
                  {isDashboard ? "Create account" : "Open dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
