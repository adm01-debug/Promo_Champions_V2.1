/**
 * Tests garantindo que a ação sugerida imperativa para
 * `pattern_type === "competitor"` + `severity === "critical"`
 * é exercitada ponta-a-ponta:
 *
 * 1) Direto via `suggestedActionFor` — valida o copy crítico/imperativo.
 * 2) Via `computeDealRisk` — monta cenário com pressão competitiva real
 *    (patterns competitor + source com keywords) que produz `severity = "critical"`,
 *    e então alimenta `suggestedActionFor("competitor", …, severity)` com a
 *    severidade calculada pelo engine, fechando o pipeline cenário→ação.
 */

import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeDealRisk,
  severityFromScore,
  suggestedActionFor,
  type LossPattern,
  type OpenDeal,
} from "./scoring.ts";
import { NOW } from "./fixtures.ts";

const URGENCY_RE = /imediata|urgente|24h|hoje/i;
const COMPETITOR_CRITICAL_RE = /battle card|24h|concorr/i;

// -----------------------------------------------------------------------------
// 1) Unit puro — competitor + critical produz copy imperativo
// -----------------------------------------------------------------------------

Deno.test("suggestedActionFor: competitor + critical → battle card + 24h (imperativo)", () => {
  const action = suggestedActionFor("competitor", "negotiation", {
    outcome: "lost",
    severity: "critical",
  });
  assertMatch(action, COMPETITOR_CRITICAL_RE);
  assertMatch(action, URGENCY_RE);
  assert(action.trim().length >= 15, `action curta demais: "${action}"`);
});

Deno.test("suggestedActionFor: competitor + high NÃO usa marcador 'IMEDIATA' (apenas critical é imperativo máximo)", () => {
  const action = suggestedActionFor("competitor", "proposal", {
    outcome: "lost",
    severity: "high",
  });
  assert(!/imediata|urgente/i.test(action), `high não deve gritar: "${action}"`);
  // mas ainda deve carregar prazo concreto
  assertMatch(action, /48h|prova social|diferencia/i);
});

// -----------------------------------------------------------------------------
// 2) End-to-end — cenário com competitor dominante e critical via engine
// -----------------------------------------------------------------------------

const COMPETITOR_HEAVY_PATTERNS: LossPattern[] = [
  // Loss factor pequeno, só para o engine não cair no branch "generic" sem score:
  // mantemos uma referência de avg_amount/avg_cycle_days para alimentar
  // stagnation/amount-alignment.
  {
    pattern_type: "loss_factor",
    label: "Preço alto",
    outcome: "lost",
    frequency: 6,
    win_rate: 12,
    avg_cycle_days: 30,
    avg_amount: 30000,
    confidence: 0.8,
  },
  // Competitor dominante: alta confiança e label claro.
  {
    pattern_type: "competitor",
    label: "Pressão competitiva — concorrente dominante",
    outcome: "lost",
    frequency: 12,
    win_rate: 8,
    avg_cycle_days: 28,
    avg_amount: 30000,
    confidence: 0.95,
  },
];

Deno.test("computeDealRisk: deal estagnado com competitor pressure produz severity=critical", () => {
  const deal: OpenDeal = {
    id: "comp-crit-1",
    client_name: "RivalCo",
    amount: 30000,
    status: "negotiation",
    category: "mid-market",
    // Múltiplas keywords disparam matches do regex COMPETITOR_KEYWORDS_RE.
    source: "concorrencia_ativa cotacao_paralela competitor_x leilao_reverso",
    updated_at: new Date(NOW.getTime() - 95 * 86_400_000).toISOString(),
    created_at: new Date(NOW.getTime() - 180 * 86_400_000).toISOString(),
  };

  const r = computeDealRisk(deal, COMPETITOR_HEAVY_PATTERNS, NOW, 40);
  assert(r, "esperava resultado de risco não-nulo");

  // Engine deve calcular severity critical (score alto + confidence alta).
  assertEquals(r.severity, "critical", `severity inesperada: ${r.severity} (score=${r.risk_score})`);

  // Reason de pressão competitiva precisa estar presente (proxy do signal).
  const codes = r.reasons_v2.map((x) => x.code);
  assert(
    codes.includes("COMPETITOR_PRESSURE"),
    `esperava COMPETITOR_PRESSURE em reasons_v2, recebi: ${codes.join(", ")}`,
  );

  // breakdown deve expor matches do competitor com pelo menos uma keyword.
  assert(
    (r.breakdown.competitor_matches?.length ?? 0) > 0,
    "esperava breakdown.competitor_matches não vazio",
  );
});

Deno.test("end-to-end: severity=critical do engine + competitor → ação imperativa (battle card / 24h)", () => {
  const deal: OpenDeal = {
    id: "comp-crit-2",
    client_name: "RivalCo II",
    amount: 30000,
    status: "negotiation",
    category: "mid-market",
    source: "concorrencia leilao competitor",
    updated_at: new Date(NOW.getTime() - 100 * 86_400_000).toISOString(),
    created_at: new Date(NOW.getTime() - 200 * 86_400_000).toISOString(),
  };

  const r = computeDealRisk(deal, COMPETITOR_HEAVY_PATTERNS, NOW, 40);
  assert(r);
  assertEquals(r.severity, "critical");

  // Alimenta o suggestedAction com a severity calculada pelo engine,
  // simulando a UI que prioriza competitor quando matches estão presentes.
  const action = suggestedActionFor("competitor", deal.status, {
    outcome: "lost",
    severity: r.severity,
  });
  assertMatch(action, COMPETITOR_CRITICAL_RE);
  assertMatch(action, URGENCY_RE);
});

Deno.test("severityFromScore: confirma que score alto + confidence alta → critical (sanidade do pipeline)", () => {
  // Alta confiança característica do competitor pattern (0.95).
  assertEquals(severityFromScore(85, 0.95), "critical");
  assertEquals(severityFromScore(90, 0.9), "critical");
  // Demoção quando confidence cai (mantém o invariante que o teste E2E depende).
  assertEquals(severityFromScore(85, 0.6), "high");
});
