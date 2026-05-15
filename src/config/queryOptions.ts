import { UI } from '@/config/constants';

/**
 * React Query configuration presets for different data categories.
 * Centralizes cache strategy decisions for consistency.
 */

/** Frequently changing data (sales, activities) — short cache, background refetch */
export const REALTIME_QUERY_OPTIONS = {
  staleTime: 60 * 1000,          // 1min (optimized for performance)
  gcTime: 10 * 60 * 1000,         // 10min
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;

/** Semi-static reference data (salespeople list, products, teams) */
export const REFERENCE_QUERY_OPTIONS = {
  staleTime: 10 * 60 * 1000,     // 10min
  gcTime: 30 * 60 * 1000,        // 30min
  refetchOnWindowFocus: false,
} as const;

/** Rarely changing config data (roles, permissions, feature flags) */
export const CONFIG_QUERY_OPTIONS = {
  staleTime: 30 * 60 * 1000,     // 30min
  gcTime: 60 * 60 * 1000,        // 1h
  refetchOnWindowFocus: false,
} as const;

/** Analytics/BI data — moderate cache, no background refetch */
export const ANALYTICS_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000,      // 5min
  gcTime: 10 * 60 * 1000,        // 10min
  refetchOnWindowFocus: false,
} as const;

/** User-specific data (XP, streaks, preferences) */
export const USER_DATA_QUERY_OPTIONS = {
  staleTime: 60 * 1000,      // 1min
  gcTime: 10 * 60 * 1000,        // 10min
  refetchOnWindowFocus: true,
} as const;

/** Default options (matches App.tsx global config) */
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: UI.STALE_TIME_MS,
  gcTime: UI.GC_TIME_MS,
  refetchOnWindowFocus: false,
} as const;
