/**
 * Política de reenvio de rascunhos de campanha que falharam.
 *
 * Regras de projeto (auditáveis e testáveis sem banco):
 *  - Erros permanentes NUNCA são reprocessados (opt-out, endereço inválido,
 *    bounce definitivo). Reenviar nesses casos queima reputação de domínio.
 *  - Erros transitórios usam backoff exponencial com jitter determinístico,
 *    limitado por teto, para não sincronizar rajadas entre rascunhos.
 *  - Após MAX_RETRIES o rascunho é encerrado como falha definitiva.
 */

/** Número máximo de tentativas adicionais após a falha inicial. */
export const MAX_RETRIES = 4;

/** Base do backoff em minutos: 5, 15, 45, 135 (teto de 240). */
const BASE_DELAY_MIN = 5;
const BACKOFF_FACTOR = 3;
const MAX_DELAY_MIN = 240;

/** Padrões de erro considerados permanentes (nunca reenviar). */
const PERMANENT_PATTERNS: readonly RegExp[] = [
  /opted_out/i,
  /missing_recipient_email/i,
  /suppress/i,
  /unsubscrib/i,
  /invalid[_ -]?(recipient|email|address)/i,
  /mailbox (does not exist|unavailable)/i,
  /hard[_ -]?bounce/i,
  /5\.1\.\d+/, // códigos SMTP 5.1.x: destinatário inexistente
  /email_infra_missing/i,
  /sender_not_configured/i,
];

/** Classifica um erro como permanente (sem reenvio) ou transitório. */
export function isPermanentError(error: string | null | undefined): boolean {
  if (!error) return false;
  return PERMANENT_PATTERNS.some((re) => re.test(error));
}

/** Jitter determinístico em [0, 1) derivado do id — evita rajadas sincronizadas. */
function jitterFor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Atraso em milissegundos antes da tentativa `attempt` (1-based). */
export function backoffMs(attempt: number, id: string): number {
  const safeAttempt = Math.max(1, Math.floor(attempt));
  const raw = BASE_DELAY_MIN * Math.pow(BACKOFF_FACTOR, safeAttempt - 1);
  const capped = Math.min(raw, MAX_DELAY_MIN);
  // Jitter de ±20% mantém a ordem de grandeza e dispersa a carga.
  const jittered = capped * (0.8 + 0.4 * jitterFor(id));
  return Math.round(jittered * 60_000);
}

/** Rascunho, na forma mínima necessária para decidir o reenvio. */
export interface RetryableDraft {
  id: string;
  error: string | null;
  retry_count: number;
  sent_at: string | null;
  next_retry_at: string | null;
}

export type RetryDecision =
  | { action: 'skip'; reason: 'already_sent' | 'no_error' | 'not_due' }
  | { action: 'give_up'; reason: 'permanent_error' | 'max_retries' }
  | { action: 'retry'; attempt: number; nextRetryAt: string };

/** Decide o destino de um rascunho no momento `now`. */
export function decideRetry(draft: RetryableDraft, now: Date): RetryDecision {
  if (draft.sent_at) return { action: 'skip', reason: 'already_sent' };
  if (!draft.error) return { action: 'skip', reason: 'no_error' };
  if (isPermanentError(draft.error)) return { action: 'give_up', reason: 'permanent_error' };

  const count = Number.isFinite(draft.retry_count) ? Math.max(0, draft.retry_count) : 0;
  if (count >= MAX_RETRIES) return { action: 'give_up', reason: 'max_retries' };

  if (draft.next_retry_at) {
    const due = new Date(draft.next_retry_at).getTime();
    // Data inválida é tratada como vencida: nunca travar um rascunho por dado sujo.
    if (Number.isFinite(due) && due > now.getTime()) {
      return { action: 'skip', reason: 'not_due' };
    }
  }

  const attempt = count + 1;
  const nextRetryAt = new Date(now.getTime() + backoffMs(attempt + 1, draft.id)).toISOString();
  return { action: 'retry', attempt, nextRetryAt };
}
