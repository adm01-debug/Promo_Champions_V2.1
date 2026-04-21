import { useCallback, useEffect, useState } from "react";

export interface AtRiskSettings {
  threshold: number;
  limit: number;
  maxVisible: number;
}

export const AT_RISK_DEFAULTS: AtRiskSettings = {
  threshold: 40,
  limit: 20,
  maxVisible: 8,
};

const STORAGE_KEY = "winloss-at-risk-settings";
const SCHEMA_VERSION = 1;

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(n)));

export function sanitize(input: Partial<AtRiskSettings>): AtRiskSettings {
  return {
    threshold: clamp(Number(input.threshold ?? AT_RISK_DEFAULTS.threshold), 0, 100),
    limit: clamp(Number(input.limit ?? AT_RISK_DEFAULTS.limit), 5, 50),
    maxVisible: clamp(Number(input.maxVisible ?? AT_RISK_DEFAULTS.maxVisible), 3, 20),
  };
}

function read(): AtRiskSettings {
  if (typeof window === "undefined") return AT_RISK_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return AT_RISK_DEFAULTS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || parsed.version !== SCHEMA_VERSION) {
      return AT_RISK_DEFAULTS;
    }
    return sanitize(parsed.settings ?? {});
  } catch {
    return AT_RISK_DEFAULTS;
  }
}

function write(settings: AtRiskSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, settings }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function useAtRiskSettings() {
  const [settings, setSettings] = useState<AtRiskSettings>(() => read());

  useEffect(() => {
    write(settings);
  }, [settings]);

  const update = useCallback((partial: Partial<AtRiskSettings>) => {
    setSettings((prev) => sanitize({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setSettings(AT_RISK_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { settings, update, reset };
}
