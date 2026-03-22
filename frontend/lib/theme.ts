"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function useResolvedTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    mounted,
    theme,
    setTheme,
    resolvedTheme: resolvedTheme ?? "light",
    isDark: (resolvedTheme ?? "light") === "dark",
  };
}
