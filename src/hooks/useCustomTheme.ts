import { useEffect, useState, useCallback } from "react";

export type AccentColor = 
  | "purple" 
  | "blue" 
  | "green" 
  | "orange" 
  | "pink" 
  | "cyan" 
  | "amber" 
  | "rose";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeConfig {
  accentColor: AccentColor;
  mode: ThemeMode;
  reducedMotion: boolean;
  highContrast: boolean;
}

const ACCENT_COLORS: Record<AccentColor, { primary: string; primaryForeground: string }> = {
  purple: { primary: "270 70% 50%", primaryForeground: "0 0% 100%" },
  blue: { primary: "217 91% 60%", primaryForeground: "0 0% 100%" },
  green: { primary: "142 76% 36%", primaryForeground: "0 0% 100%" },
  orange: { primary: "25 95% 53%", primaryForeground: "0 0% 100%" },
  pink: { primary: "330 81% 60%", primaryForeground: "0 0% 100%" },
  cyan: { primary: "189 94% 43%", primaryForeground: "0 0% 100%" },
  amber: { primary: "38 92% 50%", primaryForeground: "0 0% 0%" },
  rose: { primary: "347 77% 50%", primaryForeground: "0 0% 100%" },
};

const DEFAULT_CONFIG: ThemeConfig = {
  accentColor: "purple",
  mode: "dark",
  reducedMotion: false,
  highContrast: false,
};

export function useCustomTheme() {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    
    const stored = localStorage.getItem("theme-config");
    if (stored) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  // Apply accent color to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = ACCENT_COLORS[config.accentColor];
    
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryForeground);
    
    // High contrast mode
    if (config.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Reduced motion
    if (config.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [config]);

  // Apply theme mode
  useEffect(() => {
    const root = document.documentElement;
    
    if (config.mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.remove("light", "dark");
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(config.mode);
    }
  }, [config.mode]);

  // Persist config
  useEffect(() => {
    localStorage.setItem("theme-config", JSON.stringify(config));
    localStorage.setItem("theme", config.mode === "system" 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : config.mode
    );
  }, [config]);

  const setAccentColor = useCallback((color: AccentColor) => {
    setConfig(prev => ({ ...prev, accentColor: color }));
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setConfig(prev => ({ ...prev, mode }));
  }, []);

  const setReducedMotion = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, reducedMotion: enabled }));
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, highContrast: enabled }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    accentColors: Object.keys(ACCENT_COLORS) as AccentColor[],
    setAccentColor,
    setMode,
    setReducedMotion,
    setHighContrast,
    resetToDefaults,
  };
}
