import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeDealRisk,
  extractCompetitorKeywords,
  extractCompetitorMatches,
  type LossPattern,
  type OpenDeal,
} from "./scoring.ts";

const NOW = new Date("2026-04-21T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

const PATTERNS: LossPattern[] = [
  {
    pattern_type: "loss_factor",
    label: "Preço alto vs concorrência",
    outcome: "lost",
    frequency: 12,
    win_rate: 0.1,
    avg_cycle_days: 45,
    avg_amount: 25000,
    confidence: 0.8,
  },
  {
    pattern_type: "stuck_stage",
    label: "Negociação travada",
    outcome: "lost",
    frequency: 8,
    win_rate: 0.15,
    avg_cycle_days: 30,
    avg_amount: 20000,
    confidence: 0.75,
  },
  {
    pattern_type: "competitor",
    label: "Concorrente X",
    outcome: "lost",
    frequency: 5,
    win_rate: 0.2,
    avg_cycle_days: 35,
    avg_amount: 22000,
    confidence: 0.7,
  },
];

Deno.test("extractCompetitorKeywords captures multiple terms and dedupes", () => {
  const keywords = extractCompetitorKeywords("leilao_publico, cotacao, concorrencia, COTACAO");
  assertEquals(keywords.length, 3);
  assert(keywords.some(k => /leila/i.test(k)));
  assert(keywords.some(k => /cota/i.test(k)));
  assert(keywords.some(k => /concorr/i.test(k)));
});

Deno.test("extractCompetitorKeywords returns [] when no match", () => {
  assertEquals(extractCompetitorKeywords("inbound_form"), []);
  assertEquals(extractCompetitorKeywords(null), []);
  assertEquals(extractCompetitorKeywords(""), []);
});

Deno.test("breakdown exposes raw_score, confidence_weight and final_score consistently", () => {
  const deal: OpenDeal = {
    id: "d1",
    client_name: "Cliente A",
    amount: 25000,
    status: "negotiation",
    category: null,
    source: "leilao_publico",
    updated_at: daysAgo(40),
    created_at: daysAgo(60),
  };
  const r = computeDealRisk(deal, PATTERNS, NOW, 0);
  assert(r);
  const b = r.breakdown;
  // raw = stagnation + amount_alignment + stage_match
  assertEquals(b.raw_score, b.stagnation + b.amount_alignment + b.stage_match);
  // final = round(raw * confWeight) clamped
  const expected = Math.max(0, Math.min(100, Math.round((b.raw_score ?? 0) * (b.confidence_weight ?? 1))));
  assertEquals(b.final_score, expected);
  assertEquals(b.final_score, r.risk_score);
  // confidence_weight is in [0.5, 1]
  assert((b.confidence_weight ?? 0) >= 0.5 && (b.confidence_weight ?? 0) <= 1);
  // matched_keywords populated
  assert((b.matched_keywords ?? []).some(k => /leila/i.test(k)));
  // stage_eligible true (negotiation)
  assertEquals(b.stage_eligible, true);
  // days_stagnant matches input
  assertEquals(b.days_stagnant, 40);
  // avg refs propagated
  assertEquals(b.avg_loss_cycle_days, 45);
  assertEquals(b.avg_loss_amount, 25000);
});

Deno.test("stage_eligible=true when status in STUCK set even without stuck pattern", () => {
  const noStuckPatterns = PATTERNS.filter(p => p.pattern_type !== "stuck_stage");
  const deal: OpenDeal = {
    id: "d2",
    client_name: "Cliente B",
    amount: 25000,
    status: "proposal",
    category: null,
    source: null,
    updated_at: daysAgo(60),
    created_at: daysAgo(90),
  };
  const r = computeDealRisk(deal, noStuckPatterns, NOW, 0);
  assert(r);
  assertEquals(r.breakdown.stage_match, 0);
  assertEquals(r.breakdown.stage_eligible, true);
});
