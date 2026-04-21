import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  daysBetween,
  stagnationScore,
  amountAlignmentScore,
  stageMatchScore,
  suggestedActionFor,
  computeDealRisk,
  computeAtRiskDeals,
  type LossPattern,
  type OpenDeal,
} from "./scoring.ts";

const NOW = new Date("2026-04-21T12:00:00Z");

const lossPattern: LossPattern = {
  pattern_type: "loss_factor",
  label: "Preço alto",
  outcome: "lost",
  frequency: 8,
  win_rate: 0,
  avg_cycle_days: 38,
  avg_amount: 28500,
  confidence: 0.88,
};

const stuckPattern: LossPattern = {
  pattern_type: "stuck_stage",
  label: "Negociação travada",
  outcome: null,
  frequency: 11,
  win_rate: 22,
  avg_cycle_days: 44,
  avg_amount: 24300,
  confidence: 0.81,
};

Deno.test("daysBetween: handles null and invalid", () => {
  assertEquals(daysBetween(null, NOW), 0);
  assertEquals(daysBetween("not-a-date", NOW), 0);
  assertEquals(daysBetween("2026-04-11T12:00:00Z", NOW), 10);
});

Deno.test("stagnationScore: 0 when no days", () => {
  assertEquals(stagnationScore(0, 38), 0);
});

Deno.test("stagnationScore: caps at 50", () => {
  assertEquals(stagnationScore(100, 38), 50);
});

Deno.test("stagnationScore: linear vs avg cycle", () => {
  // 19/38 = 0.5 → 25
  assertEquals(stagnationScore(19, 38), 25);
});

Deno.test("stagnationScore: fallback when no avg cycle", () => {
  // 15/30 * 50 = 25
  assertEquals(stagnationScore(15, null), 25);
});

Deno.test("amountAlignmentScore: peak within ±20%", () => {
  assertEquals(amountAlignmentScore(28500, 28500), 25);
  assertEquals(amountAlignmentScore(30000, 28500), 25); // 5% dev
});

Deno.test("amountAlignmentScore: zero at ≥100% deviation", () => {
  assertEquals(amountAlignmentScore(57000, 28500), 0); // 100% dev
  assertEquals(amountAlignmentScore(100000, 28500), 0);
});

Deno.test("amountAlignmentScore: linear decay between 20% and 100%", () => {
  // 50% deviation → 25 * (1 - 0.3/0.8) = 25 * 0.625 = ~16
  const s = amountAlignmentScore(42750, 28500);
  assert(s >= 14 && s <= 17, `got ${s}`);
});

Deno.test("amountAlignmentScore: 0 when no avg or no amount", () => {
  assertEquals(amountAlignmentScore(0, 28500), 0);
  assertEquals(amountAlignmentScore(28500, null), 0);
});

Deno.test("stageMatchScore: 0 when status not stuck", () => {
  assertEquals(stageMatchScore("won", stuckPattern), 0);
  assertEquals(stageMatchScore("lead", stuckPattern), 0);
});

Deno.test("stageMatchScore: weighted by confidence", () => {
  // 25 * 0.81 = 20.25 → 20
  assertEquals(stageMatchScore("negotiation", stuckPattern), 20);
});

Deno.test("stageMatchScore: 0 when no stuck pattern", () => {
  assertEquals(stageMatchScore("negotiation", null), 0);
});

Deno.test("suggestedActionFor: returns coherent text per type", () => {
  assert(suggestedActionFor("loss_factor", "proposal").includes("valor"));
  assert(suggestedActionFor("stuck_stage", "negotiation").includes("negotiation"));
  assert(suggestedActionFor("competitor", null).includes("diferencia"));
});

Deno.test("computeDealRisk: critical deal — old + aligned amount + stuck", () => {
  const deal: OpenDeal = {
    id: "d1",
    client_name: "Acme",
    amount: 28000,
    status: "negotiation",
    category: null,
    source: null,
    updated_at: "2026-03-12T12:00:00Z", // 40 days ago
    created_at: "2026-02-01T00:00:00Z",
  };
  const r = computeDealRisk(deal, [lossPattern, stuckPattern], NOW);
  assert(r !== null, "should return result");
  assert(r!.risk_score >= 75, `expected critical score, got ${r!.risk_score}`);
  assert(r!.matched_pattern.length > 0);
  assert(r!.suggested_action.length > 10);
  assert(r!.reasons.length >= 2);
});

Deno.test("computeDealRisk: returns null below threshold", () => {
  const deal: OpenDeal = {
    id: "d2",
    client_name: "Fresh",
    amount: 100,
    status: "lead",
    category: null,
    source: null,
    updated_at: NOW.toISOString(),
    created_at: NOW.toISOString(),
  };
  const r = computeDealRisk(deal, [lossPattern, stuckPattern], NOW);
  assertEquals(r, null);
});

Deno.test("computeDealRisk: gracefully handles empty patterns", () => {
  const deal: OpenDeal = {
    id: "d3",
    client_name: "Old",
    amount: 5000,
    status: "proposal",
    category: null,
    source: null,
    updated_at: "2026-02-21T12:00:00Z", // ~59 days
    created_at: "2026-01-01T00:00:00Z",
  };
  const r = computeDealRisk(deal, [], NOW);
  // Stagnation only with fallback: 50 → below threshold? confidence = 0.5 floor → 25. Should be null.
  assertEquals(r, null);
});

Deno.test("computeAtRiskDeals: sorts desc and respects limit", () => {
  const deals: OpenDeal[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `d${i}`,
    client_name: `Client ${i}`,
    amount: 28000,
    status: "negotiation",
    category: null,
    source: null,
    updated_at: new Date(NOW.getTime() - (i + 30) * 86_400_000).toISOString(),
    created_at: null,
  }));
  const out = computeAtRiskDeals(deals, [lossPattern, stuckPattern], NOW, { limit: 3 });
  assertEquals(out.length, 3);
  for (let i = 1; i < out.length; i++) {
    assert(out[i - 1].risk_score >= out[i].risk_score);
  }
});

Deno.test("computeDealRisk: amount alignment + stagnation reflected in reasons", () => {
  const deal: OpenDeal = {
    id: "d4",
    client_name: "Beta",
    amount: 29000, // ±2%
    status: "proposal",
    category: null,
    source: null,
    updated_at: "2026-03-22T12:00:00Z", // ~30 days
    created_at: null,
  };
  const r = computeDealRisk(deal, [lossPattern], NOW);
  assert(r !== null);
  assert(r!.reasons.some(x => x.includes("Ticket alinhado")), "should mention amount alignment");
  assert(r!.reasons.some(x => x.includes("dias")), "should mention stagnation");
});
