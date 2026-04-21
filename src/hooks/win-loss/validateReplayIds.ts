/**
 * Client-side validation for webhook replay IDs.
 * Mirrors the server schema (`supabase/functions/winloss-webhook-replay/schema.ts`)
 * to provide immediate UX feedback before hitting the edge function.
 */

export const MAX_REPLAY_IDS = 50;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ValidateReplayResult =
  | { ok: true; ids: string[] }
  | { ok: false; message: string };

export function validateReplayIds(ids: readonly string[]): ValidateReplayResult {
  const deduped = Array.from(new Set(ids ?? []));

  if (deduped.length === 0) {
    return { ok: false, message: "Selecione ao menos 1 entrega para reenviar." };
  }

  if (deduped.length > MAX_REPLAY_IDS) {
    return {
      ok: false,
      message: `Máximo de ${MAX_REPLAY_IDS} por reenvio (selecionado: ${deduped.length}).`,
    };
  }

  const invalid = deduped.filter((id) => typeof id !== "string" || !UUID_RE.test(id));
  if (invalid.length > 0) {
    const sample = invalid
      .slice(0, 3)
      .map((id) => (id.length > 12 ? `${id.slice(0, 8)}…` : id))
      .join(", ");
    const more = invalid.length > 3 ? ` (+${invalid.length - 3})` : "";
    return {
      ok: false,
      message: `IDs inválidos detectados: ${sample}${more}.`,
    };
  }

  return { ok: true, ids: deduped };
}
