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
  /**
   * Substring(s) that must appear in `result.suggested_action` (case-insensitive).
   * - `string`: substring must appear.
   * - `string[]`: OR semantics — at least one substring must appear.
   */
  actionIncludes?: string | string[];
  /**
   * Optional substring (case-insensitive) that must appear in `result.matched_pattern`.
   * Lets a scenario assert the *family* of dominant pattern (e.g. "Preço alto",
   * "Negociação travada", "Churn pós-trial"), which is more meaningful than the
   * coarse `pattern_type` (loss_factor / stuck_stage / competitor) for storytelling.
   */
  matchedPatternLabelIncludes?: string;
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
      // medium severity loss_factor → "Reforçar valor percebido…ROI nesta semana"
      actionIncludes: ["valor", "ROI"],
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
      // OR: medium → "valor"/"ROI"/"semana"; high → "48h"; critical → "IMEDIATA"/"24h"
      actionIncludes: ["valor", "48h", "IMEDIATA", "URGENTE", "semana"],
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
      // critical severity → "AÇÃO IMEDIATA…24h"
      actionIncludes: ["IMEDIATA", "24h", "URGENTE"],
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
      // 45d satura stagnation (50) → ultrapassa stage_match (20), então loss_factor pode dominar.
      patternTypeOneOf: ["stuck_stage", "loss_factor"],
      reasonsInclude: ["45 dias"],
      // medium severity → "valor"/"ROI"/"semana"
      actionIncludes: ["valor", "ROI", "semana"],
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
      // low severity → "Revisar abordagem…próximas semanas"
      actionIncludes: ["Revisar", "abordagem", "semanas"],
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
      // Saturação: stagnation=50 + amount=25 + stage=20 = 95 raw, * conf 0.88 ≈ 84.
      included: true,
      minScore: 80,
      maxScore: 100,
      patternTypeOneOf: ["stuck_stage", "loss_factor"],
      reasonsInclude: ["120 dias"],
      // critical severity → "AÇÃO IMEDIATA…24h"
      actionIncludes: ["IMEDIATA", "URGENTE", "24h"],
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
      // high severity (score ~65) → "…48h…valor percebido…"
      actionIncludes: ["48h", "valor", "IMEDIATA"],
    },
  },
  {
    name: "critical_severity_imperative_action",
    story: "Negotiation há 180d, ticket alinhado, estágio travado — força severity=critical.",
    deal: {
      id: "s11",
      client_name: "Critical Whale",
      amount: 28500,
      status: "negotiation",
      category: "enterprise",
      source: "outbound",
      updated_at: daysAgo(180),
      created_at: daysAgo(300),
    },
    expect: {
      included: true,
      minScore: 80,
      maxScore: 100,
      patternTypeOneOf: ["loss_factor", "stuck_stage"],
      reasonsInclude: ["180 dias"],
      // Tom imperativo obrigatório quando severity=critical, independente da branch
      actionIncludes: ["IMEDIATA", "URGENTE", "24h", "hoje"],
    },
  },
  {
    name: "competitor_dominant_high",
    story:
      "Negotiation há 75d em leilão público com ticket=31k (centro do perfil 'Pressão competitiva'). Pattern competitor é selecionado como bestLoss por proximidade de avg_amount=31k, e o sinal COMPETITOR_PRESSURE entra em reasons via source 'leilao_publico'. Confidence 0.74 do pattern demote a severity para 'high' (não critical), então a ação esperada é a de tom 'high'.",
    deal: {
      id: "s12",
      client_name: "BidWar Telecom",
      amount: 31000,
      status: "negotiation",
      category: "enterprise",
      source: "leilao_publico",
      updated_at: daysAgo(75),
      created_at: daysAgo(140),
    },
    expect: {
      included: true,
      // raw≈95 × conf 0.74 ≈ 70 → high.
      minScore: 60,
      maxScore: 80,
      // O dominant_type é loss_factor/stuck_stage (engine não usa "competitor" como dominant);
      // mas o matched_pattern.label deve carregar a família "Pressão competitiva".
      patternTypeOneOf: ["loss_factor", "stuck_stage"],
      matchedPatternLabelIncludes: "Pressão competitiva",
      reasonsInclude: ["75 dias", "competitiva"],
      // high severity (loss_factor/stuck_stage) → "48h…valor percebido" (sem urgência critical).
      actionIncludes: ["48h", "valor", "percebido"],
    },
  },
  {
    name: "critical_imperative_tokens_e2e",
    story:
      "Negotiation há 240d, ticket exato no perfil de loss (28.5k), source 'concorrencia_ativa' — força saturação completa: stagnation=50 + amount=25 + stage=20 = 95 raw, × confidence 0.88 ≈ 84 → severity=critical. Garante end-to-end que a ação sugerida traz ao menos um dos tokens imperativos canônicos (URGENTE para stuck_stage, IMEDIATA para loss_factor) — qual ramo vence depende do dominant pattern, mas o tom imperativo é mandatório.",
    deal: {
      id: "s13",
      client_name: "Imperative Tokens Co.",
      amount: 28500,
      status: "negotiation",
      category: "enterprise",
      source: "concorrencia_ativa",
      updated_at: daysAgo(240),
      created_at: daysAgo(400),
    },
    expect: {
      included: true,
      minScore: 80,
      maxScore: 100,
      patternTypeOneOf: ["loss_factor", "stuck_stage"],
      reasonsInclude: ["240 dias", "competitiva"],
      // OR: critical de loss_factor → "IMEDIATA…24h"; critical de stuck_stage → "URGENTE…hoje".
      actionIncludes: ["IMEDIATA", "URGENTE"],
    },
  },
  {
    name: "competitor_critical_leilao",
    story:
      "Negotiation há 200d em leilão público, ticket=31k (centro do perfil 'Pressão competitiva'). Estagnação satura (50) + amount_alignment alto + stage=20. Apesar do bestLoss escolher loss_factor/stuck_stage como dominant_type, o sinal COMPETITOR_PRESSURE entra em reasons via source 'leilao_publico' e o label 'Pressão competitiva' deve aparecer em matched_pattern. Score saturado força severity=critical → tom imperativo (IMEDIATA ou URGENTE).",
    deal: {
      id: "s14",
      client_name: "AuctionMax",
      amount: 31000,
      status: "negotiation",
      category: "government",
      source: "leilao_publico",
      updated_at: daysAgo(200),
      created_at: daysAgo(360),
    },
    expect: {
      included: true,
      minScore: 80,
      maxScore: 100,
      patternTypeOneOf: ["loss_factor", "stuck_stage"],
      matchedPatternLabelIncludes: "Pressão competitiva",
      reasonsInclude: ["200 dias", "competitiva"],
      actionIncludes: ["IMEDIATA", "URGENTE", "24h", "hoje"],
    },
  },
  {
    name: "competitor_critical_concorrencia_ativa",
    story:
      "Proposal há 180d com source 'concorrencia_ativa' e ticket alinhado ao perfil competitor (31k). Stagnation satura, source força COMPETITOR_PRESSURE em reasons. Stage 'proposal' contribui com stage_match=20. Cobre o caminho competitor crítico via outro source string para garantir robustez do detector de keywords.",
    deal: {
      id: "s15",
      client_name: "RivalCorp Brasil",
      amount: 31000,
      status: "proposal",
      category: "enterprise",
      source: "concorrencia_ativa",
      updated_at: daysAgo(180),
      created_at: daysAgo(300),
    },
    expect: {
      included: true,
      minScore: 80,
      maxScore: 100,
      patternTypeOneOf: ["loss_factor", "stuck_stage"],
      matchedPatternLabelIncludes: "Pressão competitiva",
      reasonsInclude: ["180 dias", "competitiva"],
      actionIncludes: ["IMEDIATA", "URGENTE", "24h", "hoje"],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// History-driven fixture catalog.
// Each group represents a real-world *deal history* (preço, negociação, churn,
// concorrência, won-style). Within a group, cases vary intensity (light / strong
// / extreme / borderline / excluded) but share a coherent expected dominant
// pattern (`dominantPatternLabel`), so an analyst can answer "how does the
// pipeline react to a deal-of-type X?" by reading just one block.
//
// The amounts in each group are anchored to the `avg_amount` of the matching
// `LOSS_PATTERNS_REALISTIC` entry so `bestLoss` (chosen by amount-proximity)
// reliably resolves to the family's pattern.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScenarioGroup {
  /** Short human label for the family (e.g. "Preço alto vs concorrência"). */
  theme: string;
  /**
   * Substring expected to appear in `result.matched_pattern` for every
   * *included* case of this group. Cases may opt out individually by setting
   * `matchedPatternLabelIncludes` to a different value or omitting it.
   */
  dominantPatternLabel: string;
  cases: Scenario[];
}

const PRICING_GROUP: ScenarioGroup = {
  theme: "Preço alto vs concorrência",
  dominantPatternLabel: "Preço alto",
  cases: [
    {
      name: "pricing.light_misalignment",
      story: "Proposta há 15d, ticket exato (28.5k) — entra como medium pelo perfil de loss de preço.",
      deal: {
        id: "h-pricing-1",
        client_name: "PriceLight",
        amount: 28500,
        status: "proposal",
        category: null,
        source: "outbound",
        updated_at: daysAgo(15),
        created_at: daysAgo(40),
      },
      expect: {
        included: true,
        minScore: 50,
        maxScore: 70,
        patternTypeOneOf: ["loss_factor"],
        matchedPatternLabelIncludes: "Preço alto",
        reasonsInclude: ["15 dias", "Ticket alinhado"],
        actionIncludes: ["valor", "ROI", "semana"],
      },
    },
    {
      name: "pricing.strong_misalignment",
      story: "Proposta há 40d, ticket exato (28.5k) — satura para crítico.",
      deal: {
        id: "h-pricing-2",
        client_name: "PriceStrong",
        amount: 28500,
        status: "proposal",
        category: "enterprise",
        source: "outbound",
        updated_at: daysAgo(40),
        created_at: daysAgo(80),
      },
      expect: {
        included: true,
        minScore: 75,
        maxScore: 100,
        patternTypeOneOf: ["loss_factor"],
        matchedPatternLabelIncludes: "Preço alto",
        reasonsInclude: ["40 dias", "Ticket alinhado"],
        actionIncludes: ["IMEDIATA", "URGENTE", "24h"],
      },
    },
    {
      name: "pricing.extreme_oversize",
      story: "Negociação há 120d, ticket exato — cenário extremo de preço travado.",
      deal: {
        id: "h-pricing-3",
        client_name: "PriceExtreme",
        amount: 28500,
        status: "negotiation",
        category: "enterprise",
        source: "outbound",
        updated_at: daysAgo(120),
        created_at: daysAgo(220),
      },
      expect: {
        included: true,
        minScore: 80,
        maxScore: 100,
        patternTypeOneOf: ["loss_factor"],
        matchedPatternLabelIncludes: "Preço alto",
        reasonsInclude: ["120 dias", "Ticket alinhado"],
        actionIncludes: ["IMEDIATA", "URGENTE", "24h"],
      },
    },
    {
      name: "pricing.fresh_lead_excluded",
      story: "Lead novo (2d) com ticket alinhado a Preço alto mas estágio não-stuck — abaixo do threshold.",
      deal: {
        id: "h-pricing-4",
        client_name: "PriceFresh",
        amount: 28500,
        status: "lead",
        category: null,
        source: "outbound",
        updated_at: daysAgo(2),
        created_at: daysAgo(5),
      },
      expect: { included: false },
    },
  ],
};

const NEGOTIATION_GROUP: ScenarioGroup = {
  theme: "Negociação travada",
  // bestLoss é escolhido por amount-proximity → para isolar "Negociação travada"
  // como dominant precisamos: amount fora dos avgs (alinhamento=0) + estagnação
  // baixa o suficiente para stage_score (20) liderar. Casos border-line incluídos
  // ficam na faixa 40–55. Caso "extreme" usa estágio na razão como evidência
  // (matched_pattern vai variar).
  dominantPatternLabel: "Negociação travada",
  cases: [
    {
      name: "negotiation.borderline_stuck",
      story: "Negotiation há 7d, ticket bem fora dos avgs (1k) — stuck_stage domina.",
      deal: {
        id: "h-neg-1",
        client_name: "NegBorder",
        amount: 2000,
        status: "negotiation",
        category: null,
        source: "outbound",
        updated_at: daysAgo(7),
        created_at: daysAgo(14),
      },
      expect: {
        included: true,
        minScore: 38,
        maxScore: 55,
        patternTypeOneOf: ["loss_factor", "stuck_stage"],
        matchedPatternLabelIncludes: "Negociação travada",
        reasonsInclude: ["negotiation"],
        // low/medium severity sem urgência — frase varia, ancoragem flexível
        actionIncludes: ["estágio", "Revisar", "valor"],
      },
    },
    {
      name: "negotiation.medium_stuck",
      story: "Negotiation há 8d, mesmo ticket fora — sobe pra ~41 ainda dominante stuck_stage.",
      deal: {
        id: "h-neg-2",
        client_name: "NegMedium",
        amount: 2000,
        status: "negotiation",
        category: null,
        source: "outbound",
        updated_at: daysAgo(8),
        created_at: daysAgo(20),
      },
      expect: {
        included: true,
        minScore: 38,
        maxScore: 55,
        patternTypeOneOf: ["loss_factor", "stuck_stage"],
        matchedPatternLabelIncludes: "Negociação travada",
        reasonsInclude: ["negotiation"],
        actionIncludes: ["estágio", "Revisar", "valor"],
      },
    },
    {
      name: "negotiation.fresh_lead_excluded",
      story: "Lead novo (não-stuck) ticket baixo — nada dispara, abaixo do threshold.",
      deal: {
        id: "h-neg-3",
        client_name: "NegFreshLead",
        amount: 2000,
        status: "lead",
        category: null,
        source: "outbound",
        updated_at: daysAgo(2),
        created_at: daysAgo(5),
      },
      expect: { included: false },
    },
  ],
};

const CHURN_GROUP: ScenarioGroup = {
  theme: "Churn pós-trial",
  dominantPatternLabel: "Churn pós-trial",
  cases: [
    {
      name: "churn.post_trial_light",
      story: "Pending há 12d, ticket no perfil de churn (4.8k) — medium.",
      deal: {
        id: "h-churn-1",
        client_name: "ChurnLight",
        amount: 4800,
        status: "pending",
        category: "trial",
        source: "trial_signup",
        updated_at: daysAgo(12),
        created_at: daysAgo(25),
      },
      expect: {
        included: true,
        minScore: 45,
        maxScore: 65,
        patternTypeOneOf: ["loss_factor"],
        matchedPatternLabelIncludes: "Churn pós-trial",
        reasonsInclude: ["12 dias", "Ticket alinhado"],
        actionIncludes: ["valor", "ROI", "semana"],
      },
    },
    {
      name: "churn.post_trial_strong",
      story: "Pending há 30d (ciclo de loss=22d) — high severity.",
      deal: {
        id: "h-churn-2",
        client_name: "ChurnStrong",
        amount: 4800,
        status: "pending",
        category: "trial",
        source: "trial_signup",
        updated_at: daysAgo(30),
        created_at: daysAgo(60),
      },
      expect: {
        included: true,
        minScore: 60,
        maxScore: 80,
        patternTypeOneOf: ["loss_factor"],
        matchedPatternLabelIncludes: "Churn pós-trial",
        reasonsInclude: ["30 dias", "Ticket alinhado"],
        actionIncludes: ["48h", "valor", "IMEDIATA"],
      },
    },
    {
      name: "churn.recovered_engagement",
      story: "Mesmo perfil de churn mas updated_at recente (2d) — abaixo do threshold.",
      deal: {
        id: "h-churn-3",
        client_name: "ChurnRecovered",
        amount: 4800,
        status: "pending",
        category: "trial",
        source: "trial_signup",
        updated_at: daysAgo(2),
        created_at: daysAgo(20),
      },
      expect: { included: false },
    },
  ],
};

const COMPETITIVE_GROUP: ScenarioGroup = {
  theme: "Pressão competitiva",
  dominantPatternLabel: "Pressão competitiva",
  cases: [
    {
      name: "competitive.light_signal",
      story: "Qualified há 20d, source 'concorrencia', ticket alinhado (31k) — medium.",
      deal: {
        id: "h-comp-1",
        client_name: "CompLight",
        amount: 31000,
        status: "qualified",
        category: null,
        source: "concorrencia",
        updated_at: daysAgo(20),
        created_at: daysAgo(50),
      },
      expect: {
        included: true,
        minScore: 45,
        maxScore: 65,
        patternTypeOneOf: ["loss_factor"],
        matchedPatternLabelIncludes: "Pressão competitiva",
        reasonsInclude: ["competitiva", "20 dias"],
        actionIncludes: ["valor", "ROI", "semana"],
      },
    },
    {
      name: "competitive.strong_leilao",
      story: "Proposta há 50d em leilão público — high severity, sinal competitivo claro.",
      deal: {
        id: "h-comp-2",
        client_name: "CompLeilao",
        amount: 31000,
        status: "proposal",
        category: "government",
        source: "leilao_publico",
        updated_at: daysAgo(50),
        created_at: daysAgo(100),
      },
      expect: {
        included: true,
        minScore: 60,
        maxScore: 90,
        patternTypeOneOf: ["loss_factor"],
        matchedPatternLabelIncludes: "Pressão competitiva",
        reasonsInclude: ["competitiva", "50 dias"],
        actionIncludes: ["48h", "valor", "IMEDIATA"],
      },
    },
    {
      name: "competitive.fresh_lead_excluded",
      story: "Lead com sinal competitivo mas fresco (2d, não-stuck) — abaixo do threshold.",
      deal: {
        id: "h-comp-3",
        client_name: "CompFresh",
        amount: 31000,
        status: "lead",
        category: null,
        source: "concorrencia",
        updated_at: daysAgo(2),
        created_at: daysAgo(5),
      },
      expect: { included: false },
    },
  ],
};

const WINNING_GROUP: ScenarioGroup = {
  theme: "Padrão vencedor (não-risco)",
  // Cases here should ALL be excluded — pipeline não pode marcar deals saudáveis
  // alinhados a `win_factor` como risco. dominantPatternLabel não é asserted nos
  // excluídos (sem matched_pattern).
  dominantPatternLabel: "Abordagem consultiva",
  cases: [
    {
      name: "winning.consultative_fresh_lead",
      story: "Lead novo (2d), source consultive, ticket sem alinhamento de loss — silencioso.",
      deal: {
        id: "h-win-1",
        client_name: "WinFresh",
        amount: 100,
        status: "lead",
        category: null,
        source: "consultative_intro",
        updated_at: daysAgo(2),
        created_at: daysAgo(5),
      },
      expect: { included: false },
    },
    {
      name: "winning.recent_qualified_active",
      story: "Qualified há 3d, ticket fora dos avgs — sinal fraco, abaixo do threshold.",
      deal: {
        id: "h-win-2",
        client_name: "WinQual",
        amount: 100,
        status: "qualified",
        category: null,
        source: "consultative_intro",
        updated_at: daysAgo(3),
        created_at: daysAgo(10),
      },
      expect: { included: false },
    },
    {
      name: "winning.high_value_active_referral",
      story: "Ticket grande mas atividade ontem em estágio não-stuck — silencioso.",
      deal: {
        id: "h-win-3",
        client_name: "WinReferral",
        amount: 50000,
        status: "lead",
        category: null,
        source: "referral",
        updated_at: daysAgo(1),
        created_at: daysAgo(3),
      },
      expect: { included: false },
    },
  ],
};

export const DEAL_HISTORY_FIXTURES = {
  pricing: PRICING_GROUP,
  negotiation: NEGOTIATION_GROUP,
  churn: CHURN_GROUP,
  competitive: COMPETITIVE_GROUP,
  winning: WINNING_GROUP,
} as const;

export type DealHistoryFamily = keyof typeof DEAL_HISTORY_FIXTURES;


// ─────────────────────────────────────────────────────────────────────────────
// Flat dominant-pattern index — answers "for family X, which loss/win pattern
// would the pipeline pick as dominant?" without iterating the catalog.
//
// Resolution: substring match (case-insensitive) of `dominantPatternLabel`
// against `LOSS_PATTERNS_REALISTIC[i].label`. Returns the first hit so the UI
// can render the pattern's avg_amount / avg_cycle_days / confidence directly.
// ─────────────────────────────────────────────────────────────────────────────

export interface DominantPatternEntry {
  /** Family key from DEAL_HISTORY_FIXTURES (pricing, churn, …). */
  family: DealHistoryFamily;
  /** Human-readable theme (group.theme). */
  theme: string;
  /** The label substring expected in `result.matched_pattern`. */
  label: string;
  /** Resolved pattern from LOSS_PATTERNS_REALISTIC, or null if no match. */
  pattern: LossPattern | null;
}

function resolvePattern(label: string): LossPattern | null {
  const needle = label.toLowerCase();
  return (
    LOSS_PATTERNS_REALISTIC.find(p =>
      (p.label ?? "").toLowerCase().includes(needle),
    ) ?? null
  );
}

export const DOMINANT_PATTERNS_BY_FAMILY: Record<DealHistoryFamily, DominantPatternEntry> =
  (Object.keys(DEAL_HISTORY_FIXTURES) as DealHistoryFamily[]).reduce(
    (acc, family) => {
      const group = DEAL_HISTORY_FIXTURES[family];
      acc[family] = {
        family,
        theme: group.theme,
        label: group.dominantPatternLabel,
        pattern: resolvePattern(group.dominantPatternLabel),
      };
      return acc;
    },
    {} as Record<DealHistoryFamily, DominantPatternEntry>,
  );

/** Convenience accessor for components. */
export function getDominantPatternForFamily(
  family: DealHistoryFamily,
): DominantPatternEntry {
  return DOMINANT_PATTERNS_BY_FAMILY[family];
}

/** Ordered list (stable insertion order) — handy for `.map()` in JSX. */
export const DOMINANT_PATTERNS_LIST: DominantPatternEntry[] = Object.values(
  DOMINANT_PATTERNS_BY_FAMILY,
);
