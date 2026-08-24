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
  | "winloss_battle_card"
  | "winloss_digest"
  | "winloss_quick_filter"
  // Phase 6 — adoption metrics
  | "winloss_filter_applied"
  | "winloss_quick_filter_clicked"
  | "winloss_digest_copied"
  | "winloss_view_saved"
  | "winloss_compare_opened"
  | "winloss_script_ab_viewed"
  | "winloss_next_best_clicked";

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
