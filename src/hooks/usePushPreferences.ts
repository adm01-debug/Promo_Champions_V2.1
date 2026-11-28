import { useMemo } from 'react';
import { useSyncedSetting, type SyncStatus } from '@/hooks/useSyncedSetting';

/**
 * Categorias de push que o app realmente dispara hoje. A chave é usada no
 * payload de `send-push-notification` (`data.category`) e por isso não pode
 * mudar sem atualizar os chamadores (ver `pushCategories` no componente).
 */
export const PUSH_CATEGORIES = [
  'sdr_alerts',
  'security',
  'milestones',
  'streaks',
  'urgent_tasks',
] as const;

export type PushCategory = (typeof PUSH_CATEGORIES)[number];

export interface PushPreferences {
  categories: Record<PushCategory, boolean>;
  quietHoursEnabled: boolean;
  /** HH:mm — início e fim do silêncio, no fuso local do usuário. */
  quietHoursStart: string;
  quietHoursEnd: string;
}

const SERVER_KEY = 'push-preferences';
const STORAGE_KEY = 'champions.push-preferences';
const SCHEMA_VERSION = 1;

export const PUSH_DEFAULTS: PushPreferences = {
  categories: {
    sdr_alerts: true,
    security: true,
    milestones: true,
    streaks: true,
    urgent_tasks: true,
  },
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Aceita qualquer payload (local ou servidor) e devolve um PushPreferences válido. */
export function sanitizePushPreferences(raw: unknown): PushPreferences {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Partial<PushPreferences>;
  const rawCategories = (obj.categories ?? {}) as Record<string, unknown>;
  const categories = { ...PUSH_DEFAULTS.categories };
  for (const category of PUSH_CATEGORIES) {
    const value = rawCategories[category];
    if (typeof value === 'boolean') categories[category] = value;
  }
  return {
    categories,
    quietHoursEnabled: obj.quietHoursEnabled === true,
    quietHoursStart: TIME_RE.test(String(obj.quietHoursStart))
      ? String(obj.quietHoursStart)
      : PUSH_DEFAULTS.quietHoursStart,
    quietHoursEnd: TIME_RE.test(String(obj.quietHoursEnd))
      ? String(obj.quietHoursEnd)
      : PUSH_DEFAULTS.quietHoursEnd,
  };
}

/**
 * Verdadeiro quando o envio deve ser suprimido pelas preferências do usuário.
 * Janela que cruza a meia-noite (22:00 → 07:00) é tratada como intervalo
 * contínuo.
 */
export function isPushSuppressed(
  preferences: PushPreferences,
  category: PushCategory | undefined,
  now: Date = new Date()
): boolean {
  if (category && preferences.categories[category] === false) return true;
  if (!preferences.quietHoursEnabled) return false;

  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time: string) => {
    const [hh, mm] = time.split(':').map(Number);
    return (hh ?? 0) * 60 + (mm ?? 0);
  };
  const start = toMinutes(preferences.quietHoursStart);
  const end = toMinutes(preferences.quietHoursEnd);
  if (start === end) return false;
  return start < end
    ? minutes >= start && minutes < end
    : minutes >= start || minutes < end;
}

export interface UsePushPreferencesResult {
  preferences: PushPreferences;
  update: (patch: Partial<PushPreferences>) => void;
  toggleCategory: (category: PushCategory, enabled: boolean) => void;
  reset: () => void;
  syncStatus: SyncStatus;
}

/** Preferências de push sincronizadas entre dispositivos via `user_app_settings`. */
export function usePushPreferences(): UsePushPreferencesResult {
  const { value, update, reset, syncStatus } = useSyncedSetting<PushPreferences>({
    key: SERVER_KEY,
    storageKey: STORAGE_KEY,
    schemaVersion: SCHEMA_VERSION,
    defaults: PUSH_DEFAULTS,
    sanitize: sanitizePushPreferences,
  });

  const toggleCategory = useMemo(
    () => (category: PushCategory, enabled: boolean) => {
      update({ categories: { ...value.categories, [category]: enabled } });
    },
    [update, value.categories]
  );

  return { preferences: value, update, toggleCategory, reset, syncStatus };
}
