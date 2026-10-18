/**
 * React Query configuration presets for different data categories.
 * Centralizes cache strategy decisions for consistency.
 */

/** Frequently changing data (sales, activities) — short cache, no background refetch on tab switch */

/** Semi-static reference data (salespeople list, products, teams) */

/** Rarely changing config data (roles, permissions, feature flags) */
export const CONFIG_QUERY_OPTIONS = {
  staleTime: 30 * 60 * 1000, // 30min
  gcTime: 60 * 60 * 1000, // 1h
  refetchOnWindowFocus: false,
} as const;

/** Analytics/BI data — moderate cache, no background refetch */

/** User-specific data (XP, streaks, preferences) */

/** Default options (matches App.tsx global config) */
