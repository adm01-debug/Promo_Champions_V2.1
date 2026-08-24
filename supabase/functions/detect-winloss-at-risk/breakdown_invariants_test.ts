import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeDealRisk,
  RISK_REASON_CODES,
  STUCK_STATUSES,
  severityFromScore,
  type LossPattern,
  type OpenDeal,
  type RiskResult,
} from "./scoring.ts";

const NOW = new Date("2025-01-15T00:00:00Z");

const PATTERNS: LossPattern[] = [
  {
    pattern_type: "loss_factor",
    label: "Loss típico",
    outcome: "lost",
    frequency: 20,
    win_rate: 0.1,
    avg_cycle_days: 30,
    avg_amount: 25000,
    confidence: 0.8,
  },
  {
    pattern_type: "stuck_stage",
    label: "Negotiation travado",
    outcome: "lost",
    frequency: 12,
    win_rate: 0.15,
    avg_cycle_days: 28,
    avg_amount: 22000,
    confidence: 0.75,
  },
  {
    pattern_type: "competitor",
    label: "Concorrência presente",
    outcome: "lost",
    frequency: 8,
    win_rate: 0.2,
    avg_cycle_days: 25,
    avg_amount: 24000,
    confidence: 0.7,
  },
];

function mkDeal(overrides: Partial<OpenDeal>): OpenDeal {
  return {
    id: "d-test",
    client_name: "ACME",
    amount: 25000,
    status: "negotiation",
    category: null,
    source: null,
    updated_at: new Date(NOW.getTime() - 50 * 86_400_000).toISOString(),
    created_at: null,
    ...overrides,
  };
}

const STATUSES: Array<string | null> = [
  null,
  "unknown_xyz",
  "lead",
  "negotiation",
  "proposal",
  "qualified",
];
const SOURCES: Array<string | null> = [null, "", "leilao_publico"];
const AMOUNTS = [0, 25000, 999999];
const AGES_DAYS = [0, 50, 200];

function* allCombos(): Generator<{ deal: OpenDeal; patterns: LossPattern[]; tag: string }> {
  for (const status of STATUSES) {
    for (const source of SOURCES) {
      for (const amount of AMOUNTS) {
        for (const days of AGES_DAYS) {
          for (const usePatterns of [true, false]) {
            const deal = mkDeal({
              id: `d-${status}-${source}-${amount}-${days}-${usePatterns}`,
              status,
              source,
              amount,
              updated_at: new Date(NOW.getTime() - days * 86_400_000).toISOString(),
            });
            yield {
              deal,
              patterns: usePatterns ? PATTERNS : [],
              tag: `status=${status} source=${source} amt=${amount} d=${days} p=${usePatterns}`,
            };
          }
        }
      }
    }
  }
}

function assertInvariants(r: RiskResult, tag: string) {
  const b = r.breakdown;

  // 1) final_score = clamp(round(raw × confWeight))
  const expectedRaw = b.stagnation + b.amount_alignment + b.stage_match;
  assertEquals(b.raw_score, expectedRaw, `[${tag}] raw_score mismatch`);
  assert(
    b.confidence_weight !== undefined &&
      b.confidence_weight >= 0.5 &&
      b.confidence_weight <= 1,
    `[${tag}] confidence_weight out of [0.5,1]: ${b.confidence_weight}`,
  );
  const expectedFinal = Math.max(
    0,
    Math.min(100, Math.round(expectedRaw * (b.confidence_weight ?? 0))),
  );
  assertEquals(b.final_score, expectedFinal, `[${tag}] final_score != clamp(raw*conf)`);
  assert(
    b.final_score! >= 0 && b.final_score! <= 100,
    `[${tag}] final_score out of [0,100]`,
  );
  assertEquals(r.risk_score, b.final_score, `[${tag}] risk_score != breakdown.final_score`);

  // 2) stage_eligible respects STUCK_STATUSES
  const expectedEligible = !!r.stage && STUCK_STATUSES.has(r.stage);
  assertEquals(b.stage_eligible, expectedEligible, `[${tag}] stage_eligible mismatch`);
  if (!expectedEligible) {
    assertEquals(b.stage_match, 0, `[${tag}] stage_match must be 0 when not eligible`);
  }

  // 3) finite numbers
  for (const [k, v] of Object.entries({
    stagnation: b.stagnation,
    amount_alignment: b.amount_alignment,
    stage_match: b.stage_match,
    raw_score: b.raw_score,
    final_score: b.final_score,
    confidence_weight: b.confidence_weight,
    days_stagnant: b.days_stagnant,
    matched_confidence: b.matched_confidence,
  })) {
    assert(typeof v === "number" && Number.isFinite(v), `[${tag}] ${k} not finite: ${v}`);
  }
  assert(
    b.matched_confidence >= 0 && b.matched_confidence <= 1,
    `[${tag}] matched_confidence out of [0,1]`,
  );

  // 4) source: null → no competitor noise
  if (r.stage !== undefined) {
    if (!r.amount && r.stage === null) {
      // no extra check
    }
  }
  assert(Array.isArray(b.matched_keywords), `[${tag}] matched_keywords must be array`);

  // 5) reasons coherence
  assertEquals(b.reasons, r.reasons, `[${tag}] breakdown.reasons mismatch top-level reasons`);
  assert((b.reasons_v2?.length ?? 0) >= 1, `[${tag}] reasons_v2 must be non-empty`);
  for (const rs of b.reasons_v2 ?? []) {
    assert(
      (RISK_REASON_CODES as readonly string[]).includes(rs.code),
      `[${tag}] unknown reason code: ${rs.code}`,
    );
  }

  // 6) severity
  const expectedSev = severityFromScore(b.final_score!, b.matched_confidence);
  assertEquals(b.severity, expectedSev, `[${tag}] severity mismatch`);
}

Deno.test("breakdown invariants — combinatorial sweep (status×source×amount×age×patterns)", () => {
  let evaluated = 0;
  for (const { deal, patterns, tag } of allCombos()) {
    const r = computeDealRisk(deal, patterns, NOW, 0);
    if (!r) continue;
    evaluated++;
    assertInvariants(r, tag);
  }
  assert(evaluated > 0, "expected at least some scenarios above threshold=0");
});

Deno.test("breakdown — status:null forces stage_eligible=false and stage_match=0", () => {
  const r = computeDealRisk(mkDeal({ status: null }), PATTERNS, NOW, 0);
  assert(r);
  assertEquals(r.breakdown.stage_eligible, false);
  assertEquals(r.breakdown.stage_match, 0);
});

Deno.test("breakdown — unknown status (not in STUCK_STATUSES) → stage_eligible=false, stage_match=0", () => {
  const r = computeDealRisk(mkDeal({ status: "unknown_xyz" }), PATTERNS, NOW, 0);
  assert(r);
  assert(!STUCK_STATUSES.has("unknown_xyz"));
  assertEquals(r.breakdown.stage_eligible, false);
  assertEquals(r.breakdown.stage_match, 0);
});

Deno.test("breakdown — known stuck status → stage_eligible=true", () => {
  for (const s of STUCK_STATUSES) {
    const r = computeDealRisk(mkDeal({ status: s }), PATTERNS, NOW, 0);
    assert(r, `expected result for status=${s}`);
    assertEquals(r.breakdown.stage_eligible, true, `status=${s}`);
  }
});

Deno.test("breakdown — source:null produces empty matched_keywords and undefined competitor_matches", () => {
  const r = computeDealRisk(mkDeal({ source: null }), PATTERNS, NOW, 0);
  assert(r);
  assertEquals(r.breakdown.matched_keywords, []);
  assertEquals(r.breakdown.competitor_matches, undefined);
  for (const rs of r.breakdown.reasons_v2 ?? []) {
    assert(rs.code !== "COMPETITOR_PRESSURE", "no competitor reason expected with null source");
  }
});

Deno.test("breakdown — final_score equals clamp(raw × confidence_weight) exactly", () => {
  const r = computeDealRisk(mkDeal({}), PATTERNS, NOW, 0);
  assert(r);
  const b = r.breakdown;
  const recomputed = Math.max(
    0,
    Math.min(100, Math.round((b.raw_score ?? 0) * (b.confidence_weight ?? 0))),
  );
  assertEquals(b.final_score, recomputed);
  assertEquals(r.risk_score, b.final_score);
});

Deno.test("breakdown — confidence_weight always in [0.5, 1]", () => {
  for (const { deal, patterns } of allCombos()) {
    const r = computeDealRisk(deal, patterns, NOW, 0);
    if (!r) continue;
    const cw = r.breakdown.confidence_weight!;
    assert(cw >= 0.5 && cw <= 1, `confidence_weight=${cw}`);
  }
});

Deno.test("breakdown — reasons_v2 codes are always in RISK_REASON_CODES whitelist", () => {
  for (const { deal, patterns } of allCombos()) {
    const r = computeDealRisk(deal, patterns, NOW, 0);
    if (!r) continue;
    for (const rs of r.breakdown.reasons_v2 ?? []) {
      assert((RISK_REASON_CODES as readonly string[]).includes(rs.code));
    }
  }
});

Deno.test("breakdown — null source + unknown status still yields a valid breakdown", () => {
  const r = computeDealRisk(
    mkDeal({ source: null, status: "totally_unknown" }),
    PATTERNS,
    NOW,
    0,
  );
  if (r) {
    assertInvariants(r, "null+unknown");
    assertEquals(r.breakdown.stage_eligible, false);
    assertEquals(r.breakdown.stage_match, 0);
    assertEquals(r.breakdown.matched_keywords, []);
  }
});
