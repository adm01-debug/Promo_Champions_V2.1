import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RaceViewMode } from './useRaceViewMode';

export interface RacePreferences {
  view_mode: RaceViewMode;
  calm_mode: boolean;
  audio_muted: boolean;
  tour_completed: boolean;
}

const STORAGE_KEY = 'race_user_preferences';

const DEFAULTS: RacePreferences = {
  view_mode: 'focus',
  calm_mode: false,
  audio_muted: true,
  tour_completed: false,
};

function readLocal(): RacePreferences {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function writeLocal(prefs: RacePreferences) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* noop */ }
}

/**
 * Local-first com sync silencioso para `race_user_preferences`.
 * Falhas de rede não bloqueiam UI — preferências sempre disponíveis via localStorage.
 */
export function useRacePreferences() {
  const [prefs, setPrefs] = useState<RacePreferences>(readLocal);
  const [synced, setSynced] = useState(false);

  // Sync inicial: lê do servidor e merge com local (servidor wins se mais recente).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) return;
        const { data, error } = await supabase
          .from('race_user_preferences')
          .select('view_mode, calm_mode, audio_muted, tour_completed')
          .eq('user_id', userId)
          .maybeSingle();
        if (cancelled) return;
        if (error) return;
        if (data) {
          const merged = { ...DEFAULTS, ...data } as RacePreferences;
          setPrefs(merged);
          writeLocal(merged);
        }
        setSynced(true);
      } catch { /* offline ok */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = useCallback(async (patch: Partial<RacePreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      writeLocal(next);
      return next;
    });
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      await supabase
        .from('race_user_preferences')
        .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
    } catch { /* sync silencioso */ }
  }, []);

  return { prefs, update, synced };
}
