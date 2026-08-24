import { useCallback, useEffect, useState } from 'react';

export type RaceViewMode = 'focus' | 'immersive' | 'competitive' | 'analysis';

const STORAGE_KEY = 'race_view_mode';
/** Default mudou para 'focus' (Frente A — decluttering). */
const DEFAULT_MODE: RaceViewMode = 'focus';

function read(): RaceViewMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === 'focus' || v === 'immersive' || v === 'competitive' || v === 'analysis') return v;
  return DEFAULT_MODE;
}

/**
 * Hook persistente para o modo de visualização da Race Arena.
 * - focus (default): pista + leaderboard top-5 + 1 KPI pessoal. Zero ruído.
 * - immersive: foco total na pista (sem timing tower lateral).
 * - competitive: + commentary + ticker + broadcast + podium.
 * - analysis: tudo + score breakdown + predicted rank.
 */
export function useRaceViewMode() {
  const [mode, setModeState] = useState<RaceViewMode>(read);

  const setMode = useCallback((next: RaceViewMode) => {
    setModeState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setModeState(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    mode,
    setMode,
    isFocus: mode === 'focus',
    isImmersive: mode === 'immersive',
    isCompetitive: mode === 'competitive',
    isAnalysis: mode === 'analysis',
    /** Comentário/ticker/broadcast só aparecem fora do focus e immersive. */
    showCommentary: mode === 'competitive' || mode === 'analysis',
    showTicker: mode === 'competitive' || mode === 'analysis',
    showBroadcast: mode === 'competitive' || mode === 'analysis',
    /** Feed lateral (mantido p/ compat). */
    showFeed: mode !== 'immersive' && mode !== 'focus',
    showScoreBreakdown: mode === 'analysis',
    /** Telemetria detalhada. Em focus, mostramos apenas 1 KPI dominante. */
    showFullTelemetry: mode === 'analysis' || mode === 'competitive',
    /** Live timing tower (top-5 com gaps). Em focus virá compacta. */
    showFullTimingTower: mode !== 'immersive',
  } as const;
}
