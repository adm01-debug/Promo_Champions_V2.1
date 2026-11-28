// Regras de supressão de push por preferência do destinatário.
//
// O app grava as escolhas em `user_app_settings` (chave `push-preferences`,
// RLS por usuário). O envio é feito por service_role, por isso o filtro só
// pode existir aqui: o remetente não conhece o fuso nem as escolhas de quem
// recebe. Módulo puro (sem I/O) para ser testável com `deno test`.

export const PUSH_PREFS_KEY = 'push-preferences';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface PushPreferences {
  categories?: Record<string, boolean>;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export type SuppressReason = 'category' | 'quiet_hours';

function toMinutes(time: string): number {
  const [hh, mm] = time.split(':').map(Number);
  return (hh ?? 0) * 60 + (mm ?? 0);
}

/**
 * Motivo pelo qual o push deve ser suprimido, ou `null` se pode ser enviado.
 * Janela de silêncio que cruza a meia-noite (22:00 → 07:00) é contínua.
 */
export function suppressReasons(
  prefs: PushPreferences | null | undefined,
  category: string | undefined,
  now: Date = new Date(),
): SuppressReason | null {
  if (!prefs || typeof prefs !== 'object') return null;
  if (category && prefs.categories?.[category] === false) return 'category';
  if (prefs.quietHoursEnabled !== true) return null;

  const start = prefs.quietHoursStart;
  const end = prefs.quietHoursEnd;
  if (!start || !end || !TIME_RE.test(start) || !TIME_RE.test(end)) return null;

  const current = now.getHours() * 60 + now.getMinutes();
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from === to) return null;
  const inside = from < to ? current >= from && current < to : current >= from || current < to;
  return inside ? 'quiet_hours' : null;
}

export function isSuppressed(
  prefs: PushPreferences | null | undefined,
  category: string | undefined,
  now: Date = new Date(),
): boolean {
  return suppressReasons(prefs, category, now) !== null;
}