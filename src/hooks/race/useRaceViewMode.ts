import { useCallback, useEffect, useState } from 'react';

export type RaceViewMode = 'immersive' | 'competitive' | 'analysis';

const STORAGE_KEY = 'race_view_mode';
const DEFAULT_MODE: RaceViewMode = 'competitive';

function read(): RaceViewMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'immersive' || v === 'competitive' || v === 'analysis' ? v : DEFAULT_MODE;
}

/**
 * Hook persistente para o modo de visualização da Race Arena.
 * - immersive: só pista + leaderboard mínimo
 * - competitive: + commentary + feed + podium
 * - analysis: + score breakdown + predicted rank
 */
export function useRaceViewMode() {
  const [mode, setModeState] = useState<RaceViewMode>(read);

  const setMode = useCallback((next: RaceViewMode) => {
    setModeState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* noop */ }
  }, []);

  // sincroniza entre abas
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
    isImmersive: mode === 'immersive',
    isCompetitive: mode === 'competitive',
    isAnalysis: mode === 'analysis',
    showCommentary: mode !== 'immersive',
    showFeed: mode !== 'immersive',
    showScoreBreakdown: mode === 'analysis',
  } as const;
}
