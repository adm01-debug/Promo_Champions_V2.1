/**
 * Canonical source for at-risk scoring fixtures and dominant-pattern catalog.
 *
 * This module is the single source of truth shared between:
 *  - The Deno test suite under `supabase/functions/detect-winloss-at-risk/`
 *    (re-exports this file via a thin shim).
 *  - The front-end risk-explanation UI (e.g. `AtRiskDealsFromPatterns`).
 *
 * Plain ESM, no Deno-only imports — safe for the Vite bundle and Deno alike.
 *
 * Anchored to NOW = 2026-04-21T12:00:00Z so date math is deterministic.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror `supabase/functions/detect-winloss-at-risk/scoring.ts`.
// Kept in sync manually; both sides are tested.
// ─────────────────────────────────────────────────────────────────────────────

export interface LossPattern {
  pattern_type: string | null;
  label: string | null;
  outcome: string | null;
  frequency: number | null;
  win_rate: number | null;
  avg_cycle_days: number | null;
  avg_amount: number | null;
  confidence: number | null;
}

export interface OpenDeal {
  id: string;
  client_name: string | null;
  amount: number | null;
  status: string | null;
  category: string | null;
  source: string | null;
  updated_at: string | null;
  created_at: string | null;
}

export type RiskSeverity = "low" | "medium" | "high" | "critical";

// ─────────────────────────────────────────────────────────────────────────────
// Time anchor + helpers (exported so ad-hoc demos and tests can build cases).
// ─────────────────────────────────────────────────────────────────────────────

export const NOW = new Date("2026-04-21T12:00:00Z");

export const daysAgo = (n: number): string =>
  new Date(NOW.getTime() - n * 86_400_000).toISOString();

