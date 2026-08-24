/**
 * Helpers puros para o painel de rascunhos de campanha em falha.
 *
 * A classificação replica, no cliente, a política aplicada pela Edge Function
 * `email-bulk-retry` (ver `_shared/retry-policy.ts`). Manter as duas em sincronia
 * é intencional: o admin precisa saber, antes de agir, se o reenvio automático
 * ainda vai acontecer ou se o rascunho já foi encerrado como falha definitiva.
 */

/** Número máximo de tentativas automáticas — espelha MAX_RETRIES do backend. */
export const MAX_RETRIES = 4;

/** Padrões de erro considerados permanentes (nunca reprocessados). */
const PERMANENT_PATTERNS: readonly RegExp[] = [
  /opted_out/i,
  /missing_recipient_email/i,
  /suppress/i,
  /unsubscrib/i,
  /invalid[_ -]?(recipient|email|address)/i,
  /mailbox (does not exist|unavailable)/i,
  /hard[_ -]?bounce/i,
  /5\.1\.\d+/,
  /email_infra_missing/i,
  /sender_not_configured/i,
];

export type DraftFailureStatus = 'permanent' | 'exhausted' | 'scheduled' | 'pending';

export interface FailedDraftLike {
  id: string;
  error: string | null;
  retry_count: number;
  next_retry_at: string | null;
}

/** Classifica um erro como permanente (sem reenvio automático) ou transitório. */
export function isPermanentError(error: string | null | undefined): boolean {
  if (!error) return false;
  return PERMANENT_PATTERNS.some((re) => re.test(error));
}

/**
 * Estado do rascunho perante o reprocessamento automático.
 *  - `permanent`: erro definitivo, o robô nunca vai tentar de novo.
 *  - `exhausted`: esgotou as tentativas automáticas.
 *  - `scheduled`: há uma nova tentativa marcada no futuro.
 *  - `pending`: elegível na próxima rodada do robô.
 */
export function classifyDraft(draft: FailedDraftLike, now: Date = new Date()): DraftFailureStatus {
  if (isPermanentError(draft.error)) return 'permanent';
  if (draft.retry_count >= MAX_RETRIES) return 'exhausted';
  if (draft.next_retry_at && new Date(draft.next_retry_at).getTime() > now.getTime()) {
    return 'scheduled';
  }
  return 'pending';
}

const STATUS_LABELS: Record<DraftFailureStatus, string> = {
  permanent: 'Falha definitiva',
  exhausted: 'Tentativas esgotadas',
  scheduled: 'Reenvio agendado',
  pending: 'Na fila do robô',
};

export function statusLabel(status: DraftFailureStatus): string {
  return STATUS_LABELS[status];
}

export function statusVariant(
  status: DraftFailureStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'permanent') return 'destructive';
  if (status === 'exhausted') return 'secondary';
  if (status === 'scheduled') return 'outline';
  return 'default';
}

/** Mensagens técnicas traduzidas para linguagem operacional. */
export function humanizeError(error: string | null): string {
  if (!error) return 'Erro não informado';
  const map: Array<[RegExp, string]> = [
    [/opted_out/i, 'Destinatário na lista de descadastro'],
    [/missing_recipient_email/i, 'Rascunho sem endereço de destino'],
    [/sender_not_configured/i, 'Remetente não configurado'],
    [/email_infra_missing/i, 'Infraestrutura de e-mail indisponível'],
    [/hard[_ -]?bounce|5\.1\.\d+/i, 'Endereço inexistente (hard bounce)'],
    [/rate[_ -]?limit|429/i, 'Limite de envio do provedor atingido'],
    [/timeout|ETIMEDOUT/i, 'Tempo de resposta esgotado'],
    [/5\d\d/, 'Erro temporário do provedor'],
  ];
  for (const [re, label] of map) if (re.test(error)) return label;
  return error.length > 140 ? `${error.slice(0, 140)}…` : error;
}

export interface FailureSummary {
  total: number;
  permanent: number;
  exhausted: number;
  scheduled: number;
  pending: number;
  /** Rascunhos em que uma ação manual do admin faz diferença. */
  actionable: number;
}

/** Agrega a lista para os indicadores do topo do painel. */
export function summarize(drafts: FailedDraftLike[], now: Date = new Date()): FailureSummary {
  const summary: FailureSummary = {
    total: drafts.length,
    permanent: 0,
    exhausted: 0,
    scheduled: 0,
    pending: 0,
    actionable: 0,
  };
  for (const d of drafts) {
    const status = classifyDraft(d, now);
    summary[status] += 1;
    if (status === 'exhausted' || status === 'scheduled') summary.actionable += 1;
  }
  return summary;
}
