/**
 * Constantes do sistema PROMO CHAMPIONS
 * Centraliza valores mágicos e configurações
 */

// ===== CACHE E PERFORMANCE =====

export const CACHE_TIMES = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutos
  GC_TIME: 10 * 60 * 1000, // 10 minutos
  REFETCH_INTERVAL: 30 * 60 * 1000, // 30 minutos
} as const;

// ===== RATE LIMITING =====

export const RATE_LIMITS = {
  REQUESTS_PER_HOUR: 100,
  WINDOW_MS: 60 * 60 * 1000,
} as const;

// ===== VALIDAÇÃO =====

export const VALIDATION = {
  MAX_STRING_LENGTH: 1000,
  MAX_ARRAY_SIZE: 100,
  ALLOWED_FILTER_KEYS: [
    'userId',
    'clientId',
    'status',
    'segment',
    'dateRange',
    'teamId',
    'stageId',
  ],
} as const;

// ===== PAGINAÇÃO =====

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// ===== STATUS =====

export const DEAL_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  WON: 'won',
  LOST: 'lost',
  CANCELLED: 'cancelled',
} as const;

export const SALE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  qualified: 'Qualificada',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  completed: 'Concluída',
  lost: 'Perdida',
};

// Sales considered successful/won. Manual entry uses "completed"; the
// Bitrix24/integration sync writes "won"/"closed". All three satisfy the
// sales_status_check constraint, so revenue/conversion logic must treat them
// uniformly. Single source of truth — see isWonSaleStatus / isOpenSaleStatus.
export const WON_SALE_STATUSES = ['completed', 'won', 'closed'] as const;
export const LOST_SALE_STATUSES = ['lost', 'cancelled'] as const;

export const isWonSaleStatus = (status?: string | null): boolean =>
  !!status && (WON_SALE_STATUSES as readonly string[]).includes(status);

export const isLostSaleStatus = (status?: string | null): boolean =>
  !!status && (LOST_SALE_STATUSES as readonly string[]).includes(status);

export const isOpenSaleStatus = (status?: string | null): boolean =>
  !!status && !isWonSaleStatus(status) && !isLostSaleStatus(status);

// Domínio completo da coluna sales.status (espelha o check constraint
// sales_status_check e as chaves de SALE_STATUS_LABELS). Use os helpers
// isWonSaleStatus/isLostSaleStatus/isOpenSaleStatus para agrupamentos.
export const SALE_STATUS = {
  PENDING: 'pending',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  COMPLETED: 'completed',
  LOST: 'lost',
  CANCELLED: 'cancelled',
} as const;
export type SaleStatus = (typeof SALE_STATUS)[keyof typeof SALE_STATUS];

// Domínio `outcome` das tabelas win_loss_* (espelha o check constraint do
// banco — apenas 'won'/'lost'). Centraliza as comparações de resultado.
export const WIN_LOSS_OUTCOME = {
  WON: 'won',
  LOST: 'lost',
} as const;
export type WinLossOutcome =
  (typeof WIN_LOSS_OUTCOME)[keyof typeof WIN_LOSS_OUTCOME];

export const ACTIVITY_TYPE = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  TASK: 'task',
  NOTE: 'note',
} as const;

// ===== TIMEOUTS =====

export const TIMEOUTS = {
  API_TIMEOUT: 30000, // 30 segundos
  DEBOUNCE: 300, // 300ms
  THROTTLE: 1000, // 1 segundo
} as const;

// ===== MENSAGENS =====

export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Registro não encontrado.',
  VALIDATION: 'Dados inválidos. Verifique e tente novamente.',
} as const;

// ===== TIPOS AUXILIARES =====

export type DealStatus = (typeof DEAL_STATUS)[keyof typeof DEAL_STATUS];
export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];
