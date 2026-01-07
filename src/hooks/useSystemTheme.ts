import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function useSystemTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Theme will auto-update when set to "system"
      console.log("System theme changed:", e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      // If system, toggle to the opposite of current
      setTheme(systemTheme === "dark" ? "light" : "dark");
    }
  };

  const setSystemTheme = () => {
    setTheme("system");
  };

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const isLight = mounted ? resolvedTheme === "light" : true;
  const isSystem = mounted ? theme === "system" : false;

  return {
    theme: mounted ? theme : "system",
    resolvedTheme: mounted ? resolvedTheme : "light",
    isDark,
    isLight,
    isSystem,
    setTheme,
    toggleTheme,
    setSystemTheme,
    mounted,
  };
}