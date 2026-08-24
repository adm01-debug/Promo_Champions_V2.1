/**
 * Helpers puros para as métricas de recuperação de e-mails de campanha.
 *
 * "Recuperação" = rascunho que falhou (status *antes*) e depois foi entregue
 * com sucesso (status *depois*), seja pelo robô de retentativa automática
 * (`email-bulk-retry`) ou por reenvio manual no painel de falhas.
 *
 * A classificação do tipo de falha é feita no banco por
 * `public.normalize_bulk_failure_reason`; aqui apenas traduzimos os códigos
 * para linguagem operacional e derivamos leitura de risco.
 */

/** Códigos de tipo de falha retornados pelo banco. */
export type FailureTypeCode =
  | 'supressao'
  | 'destinatario_ausente'
  | 'endereco_invalido'
  | 'hard_bounce'
  | 'infra_remetente'
  | 'limite_de_vazao'
  | 'rede_indisponivel'
  | 'outro'
  | 'sem_erro';

const FAILURE_TYPE_LABELS: Record<string, string> = {
  supressao: 'Supressão / descadastro',
  destinatario_ausente: 'Destinatário ausente',
  endereco_invalido: 'Endereço inválido',
  hard_bounce: 'Hard bounce',
  infra_remetente: 'Remetente não configurado',
  limite_de_vazao: 'Limite de vazão',
  rede_indisponivel: 'Rede / provedor indisponível',
  outro: 'Outro erro',
  sem_erro: 'Sem erro registrado',
};

/** Tipos de falha estruturalmente irrecuperáveis (não devem gerar alarme). */
const PERMANENT_TYPES: ReadonlySet<string> = new Set([
  'supressao',
  'destinatario_ausente',
  'endereco_invalido',
  'hard_bounce',
]);

export function failureTypeLabel(code: string): string {
  return FAILURE_TYPE_LABELS[code] ?? code;
}

/** Falha permanente por natureza: taxa de recuperação baixa é esperada. */
export function isPermanentFailureType(code: string): boolean {
  return PERMANENT_TYPES.has(code);
}

/** Limite (%) abaixo do qual uma falha transitória indica problema operacional. */
export const RECOVERY_RISK_THRESHOLD = 70;

export type RecoveryHealth = 'ok' | 'atencao' | 'critico' | 'esperado';

/**
 * Leitura de saúde da recuperação.
 * Falhas permanentes recebem `esperado` — cobrar recuperação delas seria ruído.
 */
export function recoveryHealth(code: string, rate: number): RecoveryHealth {
  if (isPermanentFailureType(code)) return 'esperado';
  if (rate >= RECOVERY_RISK_THRESHOLD) return 'ok';
  if (rate >= RECOVERY_RISK_THRESHOLD / 2) return 'atencao';
  return 'critico';
}

export function recoveryHealthVariant(
  health: RecoveryHealth,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (health === 'critico') return 'destructive';
  if (health === 'atencao') return 'secondary';
  if (health === 'esperado') return 'outline';
  return 'default';
}

/** Formata minutos como duração legível (evita "0.0 min" e "930.0 min"). */
export function formatRecoveryDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '—';
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

export interface RecoveryTotalsLike {
  failed_total: number;
  recovered_count: number;
  still_failing: number;
}

export interface RecoveryTotals {
  failedTotal: number;
  recoveredCount: number;
  stillFailing: number;
  recoveryRate: number;
}

/** Consolida linhas por campanha/tipo em um total global auditável. */
export function sumRecovery(rows: readonly RecoveryTotalsLike[]): RecoveryTotals {
  const failedTotal = rows.reduce((acc, r) => acc + (r.failed_total ?? 0), 0);
  const recoveredCount = rows.reduce((acc, r) => acc + (r.recovered_count ?? 0), 0);
  const stillFailing = rows.reduce((acc, r) => acc + (r.still_failing ?? 0), 0);
  return {
    failedTotal,
    recoveredCount,
    stillFailing,
    recoveryRate: failedTotal > 0 ? Math.round((recoveredCount * 10000) / failedTotal) / 100 : 0,
  };
}

/** Trunca o prompt da campanha para exibição em tabela. */
export function campaignLabel(prompt: string | null): string {
  const clean = (prompt ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Campanha sem descrição';
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean;
}
