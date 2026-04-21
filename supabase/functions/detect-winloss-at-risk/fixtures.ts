/**
 * Realistic fixtures for end-to-end scenario validation of `computeDealRisk` /
 * `computeAtRiskDeals`. Each scenario tells a story (a real-world deal) and
 * declares the expected score band, dominant pattern, key reasons, and action.
 *
 * Anchored to NOW = 2026-04-21T12:00:00Z so date math is deterministic.
 */
import type { LossPattern, OpenDeal } from "./scoring.ts";

export const NOW = new Date("2026-04-21T12:00:00Z");

const daysAgo = (n: number): string => new Date(NOW.getTime() - n * 86_400_000).toISOString();

/** Pattern set that mirrors what `mine-win-loss-patterns` actually emits. */
export const LOSS_PATTERNS_REALISTIC: LossPattern[] = [
  {
    pattern_type: "loss_factor",
    label: "Preço alto vs concorrência",
    outcome: "lost",
    frequency: 12,
    win_rate: 0,
    avg_cycle_days: 38,
    avg_amount: 28500,
    confidence: 0.88,
  },
  {
    pattern_type: "loss_factor",
    label: "Churn pós-trial",
    outcome: "lost",
    frequency: 6,
    win_rate: 0,
    avg_cycle_days: 22,
    avg_amount: 4800,
    confidence: 0.71,
  },
  {
    pattern_type: "stuck_stage",
    label: "Negociação travada",
    outcome: null,
    frequency: 11,
    win_rate: 22,
    avg_cycle_days: 44,
    avg_amount: 24300,
    confidence: 0.81,
  },
  {
    pattern_type: "competitor",
    label: "Pressão competitiva — concorrente X",
    outcome: "lost",
    frequency: 7,
    win_rate: 18,
    avg_cycle_days: 35,
    avg_amount: 31000,
    confidence: 0.74,
  },
  {
    pattern_type: "win_factor",
    label: "Abordagem consultiva",
    outcome: "won",
    frequency: 14,
    win_rate: 78,
    avg_cycle_days: 28,
    avg_amount: 26000,
    confidence: 0.83,
  },
];

export interface ScenarioExpect {
  /** false = should be filtered out (returns null at threshold 40). */
  included: boolean;
  /** Inclusive lower bound on `risk_score`. Required when included. */
  minScore?: number;
  /** Inclusive upper bound on `risk_score`. Required when included. */
  maxScore?: number;
  /** `breakdown.matched_pattern_type` must equal one of these. */
  patternTypeOneOf?: string[];
  /** Each substring must appear in at least one of `result.reasons` (case-insensitive). */
  reasonsInclude?: string[];
  /** Substring that must appear in `result.suggested_action` (case-insensitive). */
  actionIncludes?: string;
}

export interface Scenario {
  name: string;
  story: string;
  deal: OpenDeal;
  expect: ScenarioExpect;
}

export const SCENARIOS: Scenario[] = [
  {
    name: "fresh_low_value_lead",
    story: "Lead criado há 3 dias, ticket muito baixo, sem sinais — não deve aparecer.",
    deal: {
      id: "s1",
      client_name: "NovaTech (lead)",
      amount: 1200,
      status: "lead",
      category: null,
      source: "inbound",
      updated_at: daysAgo(3),
      created_at: daysAgo(3),
    },
    expect: { included: false },
  },
  {
    name: "stuck_negotiation_aligned_ticket",
    story: "Negociação parada há 21d, ticket no centro do perfil de loss (28k).",
    deal: {
      id: "s2",
      client_name: "Acme Corp",
      amount: 28000,
      status: "negotiation",
      category: "enterprise",
      source: "outbound",
      updated_at: daysAgo(21),
      created_at: daysAgo(60),
    },
    expect: {
      included: true,
      minScore: 55,
      maxScore: 90,
      patternTypeOneOf: ["stuck_stage", "loss_factor"],
      reasonsInclude: ["21 dias", "Ticket alinhado"],
      actionIncludes: "negotiation",
    },
  },
  {
    name: "long_proposal_oversized_ticket",
    story: "Proposta há 60d, ticket muito acima (200k) — estagnação domina, ticket fora do alvo.",
    deal: {
      id: "s3",
      client_name: "MegaIndústria",
      amount: 200000,
      status: "proposal",
      category: "enterprise",
      source: "rfp",
      updated_at: daysAgo(60),
      created_at: daysAgo(120),
    },
    expect: {
      included: true,
      minScore: 50,
      maxScore: 90,
      patternTypeOneOf: ["stuck_stage", "loss_factor"],
      reasonsInclude: ["60 dias"],
    },
  },
  {
    name: "qualified_90d_competitor_pressure",
    story: "Qualified há 90d, ticket ~28k, source 'concorrencia_ativa' — múltiplos sinais críticos.",
    deal: {
      id: "s4",
      client_name: "RetailCo",
      amount: 28500,
      status: "qualified",
      category: "mid-market",
      source: "concorrencia_ativa",
      updated_at: daysAgo(90),
      created_at: daysAgo(150),
    },
    expect: {
      included: true,
      minScore: 75,
      maxScore: 100,
      patternTypeOneOf: ["stuck_stage", "loss_factor"],
      reasonsInclude: ["90 dias", "competitiva"],
    },
  },
  {
    name: "small_pending_low_engagement",
    story: "Pending há 10d, ticket bem abaixo (800) — score baixo, possivelmente excluído.",
    deal: {
      id: "s5",
      client_name: "Pequeno SaaS",
      amount: 800,
      status: "pending",
      category: "smb",
      source: "inbound",
      updated_at: daysAgo(10),
      created_at: daysAgo(15),
    },
    expect: {
      // Pode entrar marginal: 10/44*50≈11 + 25*0.81≈20 = 31 raw, *0.81 = 25 → null. Excluído.
      included: false,
    },
  },
  {
    name: "negotiation_45d_zero_amount",
    story: "Negotiation há 45d sem amount — alinhamento de ticket = 0, estagnação + estágio dominam.",
    deal: {
      id: "s6",
      client_name: "Cliente sem valor",
      amount: 0,
      status: "negotiation",
      category: null,
      source: null,
      updated_at: daysAgo(45),
      created_at: daysAgo(90),
    },
    expect: {
      included: true,
      minScore: 45,
      maxScore: 80,
      patternTypeOneOf: ["stuck_stage"],
      reasonsInclude: ["45 dias", "travado"],
      actionIncludes: "negotiation",
    },
  },
  {
    name: "fresh_proposal_perfect_ticket",
    story: "Proposta há 7d, ticket exato do perfil de loss — alinhamento alto, estagnação leve.",
    deal: {
      id: "s7",
      client_name: "TickerMatch",
      amount: 28500,
      status: "proposal",
      category: "mid-market",
      source: "outbound",
      updated_at: daysAgo(7),
      created_at: daysAgo(14),
    },
    expect: {
      included: true,
      minScore: 40,
      maxScore: 65,
      patternTypeOneOf: ["loss_factor", "stuck_stage"],
      reasonsInclude: ["Ticket alinhado"],
    },
  },
  {
    name: "deal_without_dates",
    story: "Deal sem updated_at nem created_at — nenhuma estagnação computável, abaixo do threshold.",
    deal: {
      id: "s8",
      client_name: "Sem datas",
      amount: 5000,
      status: "proposal",
      category: null,
      source: null,
      updated_at: null,
      created_at: null,
    },
    expect: { included: false },
  },
  {
    name: "super_stagnant_negotiation",
    story: "Negotiation há 120d com ticket alinhado — score deve saturar perto do máximo.",
    deal: {
      id: "s9",
      client_name: "Zumbi Industries",
      amount: 28500,
      status: "negotiation",
      category: "enterprise",
      source: "outbound",
      updated_at: daysAgo(120),
      created_at: daysAgo(200),
    },
    expect: {
      included: true,
      minScore: 85,
      maxScore: 100,
      patternTypeOneOf: ["stuck_stage", "loss_factor"],
      reasonsInclude: ["120 dias", "travado"],
      actionIncludes: "negotiation",
    },
  },
  {
    name: "proposal_30d_competitive_source",
    story: "Proposta há 30d, source 'leilao_publico' — sinal competitivo na razão.",
    deal: {
      id: "s10",
      client_name: "Gov Procurement",
      amount: 31000,
      status: "proposal",
      category: "government",
      source: "leilao_publico",
      updated_at: daysAgo(30),
      created_at: daysAgo(60),
    },
    expect: {
      included: true,
      minScore: 45,
      maxScore: 90,
      patternTypeOneOf: ["loss_factor", "stuck_stage"],
      reasonsInclude: ["30 dias", "competitiva"],
    },
  },
];
