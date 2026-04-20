import { useCallback } from "react";

type WLEvent =
  | "winloss_view"
  | "winloss_drill"
  | "winloss_export"
  | "winloss_run"
  | "winloss_compare"
  | "winloss_print"
  | "winloss_save_view"
  | "winloss_load_view"
  | "winloss_battle_card";

interface AnalyticsHost {
  analytics?: { track: (event: string, payload?: Record<string, unknown>) => void };
}

/**
 * Telemetria leve do módulo Win/Loss.
 * Usa window.analytics se existir; caso contrário, no-op silencioso (sem console).
 */
export const useWinLossTelemetry = () => {
  return useCallback((event: WLEvent, payload?: Record<string, unknown>) => {
    try {
      const w = window as unknown as AnalyticsHost;
      w.analytics?.track?.(event, { ts: Date.now(), ...payload });
    } catch {
      // silently ignore
    }
  }, []);
};
