import { FC, useEffect, useState } from 'react';
import { Bell, Sliders, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRaceCalm } from '@/contexts/RaceCalmContext';
import {
  getRaceNotificationsEnabled,
  setRaceNotificationsEnabled,
} from '@/hooks/race/useRaceSmartNotifications';
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
  const [notifEnabled, setNotifEnabled] = useState<boolean>(() => getRaceNotificationsEnabled());
  const { calm, toggle: toggleCalm } = useRaceCalm();

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
        <Button variant="outline" size="icon" title="Preferências de acessibilidade e som">
          <Sliders className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-4">
          {/* Modo Calm — destaque no topo */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="pref-calm" className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <Wind className="w-4 h-4 text-primary" /> Modo Calm
              </Label>
              <Switch id="pref-calm" checked={calm} onCheckedChange={toggleCalm} />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Desliga partículas, screen-shake, fogos e neon. Mantém toda a informação.
            </p>
          </div>

          {/* Notificações inteligentes */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="pref-notif" className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <Bell className="w-4 h-4 text-primary" /> Notificações da pista
              </Label>
              <Switch
                id="pref-notif"
                checked={notifEnabled}
                onCheckedChange={(v) => { setNotifEnabled(v); setRaceNotificationsEnabled(v); }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Toasts contextuais: rival ultrapassou, perto do pódio, última hora.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Sons da Arena</h4>
            <p className="text-xs text-muted-foreground">Ative/desative por evento</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
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
