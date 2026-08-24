import { useCallback, useEffect, useState } from "react";

export type WLGranularity = "week" | "month";
export type WLForecastHorizon = 3 | 6 | 12;

export interface WinLossViewPrefs {
  granularity: WLGranularity;
  forecastHorizon: WLForecastHorizon;
}

export const VIEW_PREFS_DEFAULTS: WinLossViewPrefs = {
  granularity: "month",
  forecastHorizon: 3,
};

const STORAGE_KEY = "winloss-view-prefs";
const SCHEMA_VERSION = 1;

const ALLOWED_GRAN: WLGranularity[] = ["week", "month"];
const ALLOWED_HORIZON: WLForecastHorizon[] = [3, 6, 12];

export function sanitize(input: Partial<WinLossViewPrefs>): WinLossViewPrefs {
  const granularity = ALLOWED_GRAN.includes(input.granularity as WLGranularity)
    ? (input.granularity as WLGranularity)
    : VIEW_PREFS_DEFAULTS.granularity;
  const forecastHorizon = ALLOWED_HORIZON.includes(Number(input.forecastHorizon) as WLForecastHorizon)
    ? (Number(input.forecastHorizon) as WLForecastHorizon)
    : VIEW_PREFS_DEFAULTS.forecastHorizon;
  return { granularity, forecastHorizon };
}

function read(): WinLossViewPrefs {
  if (typeof window === "undefined") return VIEW_PREFS_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return VIEW_PREFS_DEFAULTS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || parsed.version !== SCHEMA_VERSION) {
      return VIEW_PREFS_DEFAULTS;
    }
    return sanitize(parsed.prefs ?? {});
  } catch {
    return VIEW_PREFS_DEFAULTS;
  }
}

function write(prefs: WinLossViewPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, prefs }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function useWinLossViewPrefs() {
  const [prefs, setPrefs] = useState<WinLossViewPrefs>(() => read());

  useEffect(() => {
    write(prefs);
  }, [prefs]);

  const update = useCallback((partial: Partial<WinLossViewPrefs>) => {
    setPrefs((prev) => sanitize({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setPrefs(VIEW_PREFS_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { prefs, update, reset };
}
