"use client";

import { MoonStar, SunMedium } from "lucide-react";

import { useResolvedTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { mounted, isDark, setTheme } = useResolvedTheme();

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
    document.body.classList.add("theme-transition");
    window.setTimeout(() => document.body.classList.remove("theme-transition"), 350);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className="relative overflow-hidden"
    >
      <SunMedium
        className={`absolute h-4 w-4 transition-all duration-300 ${mounted && isDark ? "translate-y-6 scale-75 opacity-0" : "translate-y-0 scale-100 opacity-100"}`}
      />
      <MoonStar
        className={`absolute h-4 w-4 transition-all duration-300 ${mounted && isDark ? "translate-y-0 scale-100 opacity-100" : "-translate-y-6 scale-75 opacity-0"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
