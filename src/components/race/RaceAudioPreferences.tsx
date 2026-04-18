import { FC, useEffect, useState } from 'react';
import { Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { RaceSoundType } from '@/hooks/race/useRaceSounds';

const STORAGE_KEY = 'race_sound_prefs';

const SOUND_LABELS: Record<RaceSoundType, string> = {
  boost: 'Boost (rank up)',
  overtake: 'Ultrapassagem',
  checkpoint: 'Checkpoint',
  victory: 'Vitória',
  countdown: 'Contagem regressiva',
  pitstop: 'Pit Stop',
  powerup: 'Power-up / Combo',
  leader_takeover: 'Tomada de liderança',
  combo_tier: 'Combo tier-up',
  season_end: 'Final de season',
};

type Prefs = Record<RaceSoundType, boolean>;

const DEFAULT_PREFS: Prefs = {
  boost: true, overtake: true, checkpoint: true, victory: true,
  countdown: true, pitstop: true, powerup: true,
  leader_takeover: true, combo_tier: true, season_end: true,
};

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Popover com toggles individuais por tipo de som.
 * Persiste em localStorage e é consultado por `useRaceSounds`.
 */
export const RaceAudioPreferences: FC = () => {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      window.dispatchEvent(new CustomEvent('race-sound-prefs-change'));
    } catch { /* noop */ }
  }, [prefs]);

  const toggle = (key: RaceSoundType) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="Preferências de som">
          <Sliders className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-3">
          <div>
            <h4 className="font-display text-sm font-semibold">Sons da Arena</h4>
            <p className="text-xs text-muted-foreground">Ative/desative por evento</p>
          </div>
          <div className="space-y-2">
            {(Object.keys(SOUND_LABELS) as RaceSoundType[]).map((k) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <Label htmlFor={`pref-${k}`} className="text-sm font-normal cursor-pointer">
                  {SOUND_LABELS[k]}
                </Label>
                <Switch id={`pref-${k}`} checked={prefs[k]} onCheckedChange={() => toggle(k)} />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
