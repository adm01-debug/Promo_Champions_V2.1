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

const THEME_STORAGE_KEY = "theme-config";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";
const isBrowser = typeof window !== "undefined";

type ThemeListener = (config: ThemeConfig) => void;

const listeners = new Set<ThemeListener>();
let currentConfig: ThemeConfig = DEFAULT_CONFIG;
let initialized = false;
let mediaQuerySubscribed = false;
let storageSubscribed = false;

const accentColorKeys = Object.keys(ACCENT_COLORS) as AccentColor[];

function resolveSystemTheme(): "light" | "dark" {
  if (!isBrowser) return "dark";
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
}

function normalizeConfig(input: Partial<ThemeConfig> | null | undefined): ThemeConfig {
  const accentColor = input?.accentColor;
  const mode = input?.mode;

  return {
    accentColor:
      accentColor && accentColorKeys.includes(accentColor as AccentColor)
        ? (accentColor as AccentColor)
        : DEFAULT_CONFIG.accentColor,
    mode: mode === "light" || mode === "dark" || mode === "system" ? mode : DEFAULT_CONFIG.mode,
    reducedMotion:
      typeof input?.reducedMotion === "boolean"
        ? input.reducedMotion
        : DEFAULT_CONFIG.reducedMotion,
    highContrast:
      typeof input?.highContrast === "boolean"
        ? input.highContrast
        : DEFAULT_CONFIG.highContrast,
  };
}

function applyConfigToDom(config: ThemeConfig) {
  if (!isBrowser) return;

  const root = document.documentElement;
  const colors = ACCENT_COLORS[config.accentColor];
  const resolvedMode = config.mode === "system" ? resolveSystemTheme() : config.mode;

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);

  root.classList.toggle("high-contrast", config.highContrast);
  root.classList.toggle("reduce-motion", config.reducedMotion);

  root.classList.remove("light", "dark");
  root.classList.add(resolvedMode);
}

function persistConfig(config: ThemeConfig) {
  if (!isBrowser) return;

  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  localStorage.setItem("theme", config.mode === "system" ? resolveSystemTheme() : config.mode);
}

function notifySubscribers() {
  listeners.forEach((listener) => listener(currentConfig));
}

function commitConfig(nextConfig: ThemeConfig, options?: { persist?: boolean; notify?: boolean }) {
  currentConfig = normalizeConfig(nextConfig);
  applyConfigToDom(currentConfig);

  if (options?.persist !== false) {
    persistConfig(currentConfig);
  }

  if (options?.notify !== false) {
    notifySubscribers();
  }
}

function loadStoredConfig(): ThemeConfig {
  if (!isBrowser) return DEFAULT_CONFIG;

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored) {
    try {
      return normalizeConfig(JSON.parse(stored));
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  const legacyTheme = localStorage.getItem("theme");
  if (legacyTheme === "light" || legacyTheme === "dark") {
    return { ...DEFAULT_CONFIG, mode: legacyTheme };
  }

  return DEFAULT_CONFIG;
}

function initializeTheme() {
  if (!isBrowser || initialized) return;

  currentConfig = loadStoredConfig();
  commitConfig(currentConfig, { persist: true, notify: false });
  initialized = true;

  if (!mediaQuerySubscribed) {
    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    const handleThemeChange = () => {
      if (currentConfig.mode === "system") {
        applyConfigToDom(currentConfig);
        persistConfig(currentConfig);
        notifySubscribers();
      }
    };

    mediaQuery.addEventListener("change", handleThemeChange);
    mediaQuerySubscribed = true;
  }

  if (!storageSubscribed) {
    window.addEventListener("storage", (event) => {
      if (event.key !== THEME_STORAGE_KEY || !event.newValue) return;

      try {
        const nextConfig = normalizeConfig(JSON.parse(event.newValue));
        commitConfig(nextConfig, { persist: false, notify: true });
      } catch {
        // Ignore malformed config from other tabs
      }
    });
    storageSubscribed = true;
  }
}

export function useCustomTheme() {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    initializeTheme();
    return currentConfig;
  });

  useEffect(() => {
    initializeTheme();

    const listener: ThemeListener = (nextConfig) => setConfig(nextConfig);
    listeners.add(listener);

    setConfig(currentConfig);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateConfig = useCallback((updater: (prev: ThemeConfig) => ThemeConfig) => {
    const nextConfig = updater(currentConfig);
    commitConfig(nextConfig, { persist: true, notify: true });
  }, []);

  const setAccentColor = useCallback((color: AccentColor) => {
    updateConfig((prev) => ({ ...prev, accentColor: color }));
  }, [updateConfig]);

  const setMode = useCallback((mode: ThemeMode) => {
    updateConfig((prev) => ({ ...prev, mode }));
  }, [updateConfig]);

  const setReducedMotion = useCallback((enabled: boolean) => {
    updateConfig((prev) => ({ ...prev, reducedMotion: enabled }));
  }, [updateConfig]);

  const setHighContrast = useCallback((enabled: boolean) => {
    updateConfig((prev) => ({ ...prev, highContrast: enabled }));
  }, [updateConfig]);

  const resetToDefaults = useCallback(() => {
    commitConfig(DEFAULT_CONFIG, { persist: true, notify: true });
  }, []);

  return {
    config,
    accentColors: accentColorKeys,
    setAccentColor,
    setMode,
    setReducedMotion,
    setHighContrast,
    resetToDefaults,
  };
}
