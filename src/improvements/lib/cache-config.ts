// src/lib/cache-config.ts
// Cache Strategy - Configurações Otimizadas para React Query
// Data: 2024-12-28

import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// CACHE PRESETS
// ============================================================================

export const CACHE_PRESETS = {
  /**
   * STATIC: Para dados que nunca mudam (até invalidação manual)
   * Ex: Configurações do sistema, listas de países, categorias fixas
   */
  STATIC: {
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60 * 24, // 24 horas
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  /**
   * LONG: Dados que mudam raramente (1 hora)
   * Ex: Dashboards, KPIs consolidados, relatórios mensais
   */
  LONG: {
    staleTime: 1000 * 60 * 60, // 1 hora
    cacheTime: 1000 * 60 * 60 * 2, // 2 horas
    refetchOnMount: 'stale' as const,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },

  /**
   * MEDIUM: Dados com mudanças moderadas (5 minutos)
   * Ex: Lista de clientes, produtos, pipeline
   */
  MEDIUM: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    refetchOnMount: 'stale' as const,
    refetchOnWindowFocus: 'stale' as const,
    refetchOnReconnect: true,
  },

  /**
   * SHORT: Dados que mudam frequentemente (30 segundos)
   * Ex: Atividades recentes, notificações, status em tempo real
   */
  SHORT: {
    staleTime: 1000 * 30, // 30 segundos
    cacheTime: 1000 * 60, // 1 minuto
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  /**
   * REALTIME: Sem cache, sempre buscar dados frescos
   * Ex: Chat ao vivo, feeds de eventos, monitores em tempo real
   */
  REALTIME: {
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 3000, // Poll a cada 3 segundos
  },

  /**
   * ONE_TIME: Buscar uma vez e manter em cache
   * Ex: Perfil do usuário logado (até logout), onboarding
   */
  ONE_TIME: {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
} as const;

// ============================================================================
// QUERY KEY PATTERNS
// ============================================================================

/**
 * Padrões de chaves para queries
 * Usar hierarquia: [entity, ...params]
 */
export const QUERY_KEYS = {
  // User
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  userPermissions: ['user', 'permissions'] as const,
  userPreferences: ['user', 'preferences'] as const,

  // Clients
  clients: ['clients'] as const,
  clientsList: (filters?: Record<string, any>) => ['clients', 'list', filters] as const,
  clientDetail: (id: string) => ['clients', 'detail', id] as const,
  clientActivities: (id: string) => ['clients', 'activities', id] as const,

  // Deals
  deals: ['deals'] as const,
  dealsList: (filters?: Record<string, any>) => ['deals', 'list', filters] as const,
  dealDetail: (id: string) => ['deals', 'detail', id] as const,
  pipeline: (stageId?: string) => ['pipeline', stageId] as const,

  // Analytics
  dashboard: ['dashboard'] as const,
  dashboardKPIs: (period?: string) => ['dashboard', 'kpis', period] as const,
  salesMetrics: (period: string) => ['analytics', 'sales', period] as const,
  conversionFunnel: ['analytics', 'funnel'] as const,

  // Activities
  activities: ['activities'] as const,
  activitiesList: (filters?: Record<string, any>) => ['activities', 'list', filters] as const,
  activityDetail: (id: string) => ['activities', 'detail', id] as const,

  // Notifications
  notifications: ['notifications'] as const,
  notificationCount: ['notifications', 'count'] as const,

  // Products
  products: ['products'] as const,
  productsList: (filters?: Record<string, any>) => ['products', 'list', filters] as const,
  productDetail: (id: string) => ['products', 'detail', id] as const,

  // Teams
  teams: ['teams'] as const,
  teamsList: ['teams', 'list'] as const,
  teamDetail: (id: string) => ['teams', 'detail', id] as const,
  teamPerformance: (id: string, period: string) => ['teams', 'performance', id, period] as const,

  // Gamification
  gamification: ['gamification'] as const,
  leaderboard: (period: string) => ['gamification', 'leaderboard', period] as const,
  achievements: (userId?: string) => ['gamification', 'achievements', userId] as const,
  challenges: ['gamification', 'challenges'] as const,

  // Reports
  reports: ['reports'] as const,
  reportData: (reportId: string, params?: Record<string, any>) => 
    ['reports', reportId, params] as const,

  // Configurations
  config: ['config'] as const,
  stages: ['config', 'stages'] as const,
  sources: ['config', 'sources'] as const,
  categories: ['config', 'categories'] as const,
} as const;

// ============================================================================
// CACHE STRATEGY MAP
// ============================================================================

/**
 * Mapeamento de queries para estratégias de cache
 */
export const CACHE_STRATEGY_MAP = new Map<string, typeof CACHE_PRESETS[keyof typeof CACHE_PRESETS]>([
  // STATIC
  ['config', CACHE_PRESETS.STATIC],
  ['stages', CACHE_PRESETS.STATIC],
  ['sources', CACHE_PRESETS.STATIC],
  ['categories', CACHE_PRESETS.STATIC],
  ['user-permissions', CACHE_PRESETS.STATIC],

  // ONE_TIME
  ['user-profile', CACHE_PRESETS.ONE_TIME],
  ['user-preferences', CACHE_PRESETS.ONE_TIME],

  // LONG (1 hora)
  ['dashboard-kpis', CACHE_PRESETS.LONG],
  ['sales-metrics', CACHE_PRESETS.LONG],
  ['conversion-funnel', CACHE_PRESETS.LONG],
  ['team-performance', CACHE_PRESETS.LONG],
  ['reports', CACHE_PRESETS.LONG],
  ['leaderboard', CACHE_PRESETS.LONG],

  // MEDIUM (5 minutos)
  ['clients', CACHE_PRESETS.MEDIUM],
  ['deals', CACHE_PRESETS.MEDIUM],
  ['pipeline', CACHE_PRESETS.MEDIUM],
  ['products', CACHE_PRESETS.MEDIUM],
  ['teams', CACHE_PRESETS.MEDIUM],
  ['achievements', CACHE_PRESETS.MEDIUM],
  ['challenges', CACHE_PRESETS.MEDIUM],

  // SHORT (30 segundos)
  ['activities', CACHE_PRESETS.SHORT],
  ['notifications', CACHE_PRESETS.SHORT],
  ['notification-count', CACHE_PRESETS.SHORT],

  // REALTIME
  ['chat-messages', CACHE_PRESETS.REALTIME],
  ['live-feed', CACHE_PRESETS.REALTIME],
]);

// ============================================================================
// HELPER: Get Cache Strategy
// ============================================================================

/**
 * Retorna estratégia de cache baseada na query key
 */
export function getCacheStrategy(queryKey: readonly unknown[]) {
  const baseKey = queryKey[0] as string;
  return CACHE_STRATEGY_MAP.get(baseKey) || CACHE_PRESETS.MEDIUM;
}

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/**
 * Configuração otimizada do Query Client
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      ...CACHE_PRESETS.MEDIUM, // Default: Medium cache
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online' as const,
      
      // Função para determinar se deve refetch
      staleTime: (query) => {
        const strategy = getCacheStrategy(query.queryKey);
        return strategy.staleTime;
      },
    },
    mutations: {
      retry: 1,
      networkMode: 'online' as const,
      
      // Invalidar queries relacionadas após mutação
      onSuccess: async (data, variables, context, query) => {
        // A lógica de invalidação será específica por mutation
      },
    },
  },
};

/**
 * Cria instância do Query Client com configurações otimizadas
 */
export function createOptimizedQueryClient() {
  return new QueryClient(queryClientConfig);
}

// ============================================================================
// PREFETCH HELPERS
// ============================================================================

/**
 * Prefetch queries comuns no início da aplicação
 */
export async function prefetchCommonQueries(queryClient: QueryClient) {
  // User data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.userPermissions,
      staleTime: CACHE_PRESETS.STATIC.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.stages,
      staleTime: CACHE_PRESETS.STATIC.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.sources,
      staleTime: CACHE_PRESETS.STATIC.staleTime,
    }),
  ]);
}

// ============================================================================
// INVALIDATION PATTERNS
// ============================================================================

/**
 * Padrões de invalidação para mutations comuns
 */
export const INVALIDATION_PATTERNS = {
  // Client mutations
  clientCreated: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardKPIs() });
  },

  clientUpdated: (queryClient: QueryClient, clientId: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clientDetail(clientId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
  },

  // Deal mutations
  dealCreated: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipeline() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardKPIs() });
  },

  dealStageChanged: (queryClient: QueryClient, dealId: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dealDetail(dealId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipeline() });
  },

  dealWon: (queryClient: QueryClient, dealId: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dealDetail(dealId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipeline() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardKPIs() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.salesMetrics('month') });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboard('week') });
  },

  // Activity mutations
  activityCompleted: (queryClient: QueryClient, activityId: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activityDetail(activityId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.achievements() });
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  CACHE_PRESETS,
  QUERY_KEYS,
  getCacheStrategy,
  createOptimizedQueryClient,
  prefetchCommonQueries,
  INVALIDATION_PATTERNS,
};
