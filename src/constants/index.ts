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
  pending: "Pendente",
  qualified: "Qualificada",
  proposal: "Proposta",
  negotiation: "Negociação",
  completed: "Concluída",
  lost: "Perdida",
};


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

export type DealStatus = typeof DEAL_STATUS[keyof typeof DEAL_STATUS];
export type ActivityType = typeof ACTIVITY_TYPE[keyof typeof ACTIVITY_TYPE];
