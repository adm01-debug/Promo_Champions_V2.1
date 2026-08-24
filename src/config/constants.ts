/**
 * Constantes centralizadas do PROMO CHAMPIONS
 * Evita "magic numbers" espalhados pelo código
 */

// ── Gamificação ──
export const GAMIFICATION = {
  XP_PER_SALE: 100,
  XP_PER_ACTIVITY: 25,
  XP_PER_TASK_COMPLETE: 50,
  XP_STREAK_BONUS: 150,
  XP_LEVEL_BASE: 1000,
  XP_LEVEL_MULTIPLIER: 1.5,
  MAX_COMBO_TIER: 5,
  COMBO_DECAY_HOURS: 2,
} as const;

// ── Mapa de Clientes ──
export const CLIENT_MAP = {
  /** Tier de valor para marcadores verdes */
  TIER_PREMIUM: 50_000,
  /** Tier de valor para marcadores dourados */
  TIER_REGULAR: 10_000,
  /** Centro padrão do mapa (Brasil) */
  DEFAULT_CENTER: [-14.235, -51.925] as [number, number],
  DEFAULT_ZOOM: 4,
  MAX_FIT_ZOOM: 14,
  CLUSTER_RADIUS: 50,
  /** Intervalo entre geocodificações (ms) — respeita rate limit Nominatim */
  GEOCODE_INTERVAL_MS: 1100,
  SLIDER_MAX_VALUE: 200_000,
  SLIDER_STEP: 5_000,
} as const;

// ── Pipeline & Deals ──
export const PIPELINE = {
  STAGES: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const,
  SLA_HOURS_DEFAULT: 48,
  STAGNANT_DAYS: 14,
  WIN_PROBABILITY: {
    lead: 10,
    qualified: 25,
    proposal: 50,
    negotiation: 75,
    closed_won: 100,
    closed_lost: 0,
  },
} as const;

// ── Sessão & Segurança ──
export const SECURITY = {
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  TOKEN_REFRESH_INTERVAL_MS: 4 * 60 * 1000,
  RATE_LIMIT_WINDOW_MS: 60_000,
  MAX_REQUESTS_PER_WINDOW: 100,
} as const;

// ── UI & Performance ──
export const UI = {
  TOAST_DURATION_MS: 4_000,
  DEBOUNCE_MS: 300,
  ANIMATION_DURATION_MS: 200,
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MAX: 100,
  STALE_TIME_MS: 1 * 60 * 1000,
  GC_TIME_MS: 10 * 60 * 1000,
} as const;

// ── Churn & Analytics ──
export const ANALYTICS = {
  CHURN_RISK_DAYS: 30,
  CHURN_HIGH_RISK_DAYS: 60,
  COHORT_MONTHS: 6,
  LTV_SEGMENTS: ['Premium', 'Regular', 'Basic'] as const,
} as const;
