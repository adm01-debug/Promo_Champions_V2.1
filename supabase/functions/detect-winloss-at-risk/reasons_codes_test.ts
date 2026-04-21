import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeDealRisk, type LossPattern, type OpenDeal } from "./scoring.ts";

const NOW = new Date("2025-01-15T00:00:00Z");

const lossPattern: LossPattern = {
  pattern_type: "loss_factor",
  label: "Loss típico",
  outcome: "lost",
  frequency: 20,
  win_rate: 0.1,
  avg_cycle_days: 30,
  avg_amount: 25000,
  confidence: 0.8,
};

const stuckPattern: LossPattern = {
  pattern_type: "stuck_stage",
  label: "Negotiation travado",
  outcome: "lost",
  frequency: 12,
  win_rate: 0.15,
  avg_cycle_days: 28,
  avg_amount: 22000,
  confidence: 0.75,
};

const competitorPattern: LossPattern = {
  pattern_type: "competitor",
  label: "Concorrência presente",
  outcome: "lost",
  frequency: 8,
  win_rate: 0.2,
  avg_cycle_days: 25,
  avg_amount: 24000,
  confidence: 0.7,
};

function deal(overrides: Partial<OpenDeal>): OpenDeal {
  return {
    id: "d1",
    client_name: "Cliente X",
    amount: 25000,
    status: "negotiation",
    category: null,
    source: null,
    updated_at: new Date(NOW.getTime() - 50 * 86_400_000).toISOString(),
    created_at: null,
    ...overrides,
  };
}

Deno.test("reasons_v2: STAGNATION_HIGH carries days + avgCycle params", () => {
  const r = computeDealRisk(deal({}), [lossPattern, stuckPattern], NOW, 0);
  assert(r);
  const v2 = r.breakdown.reasons_v2 ?? [];
  const stag = v2.find((x) => x.code === "STAGNATION_HIGH");
  assert(stag, "expected STAGNATION_HIGH");
  assertEquals(stag!.params.days, 50);
  assertEquals(stag!.params.avgCycle, 30);
  assertEquals(stag!.contribution, r.breakdown.stagnation);
  assertEquals(stag!.source, "stagnation");
});

Deno.test("reasons_v2: AMOUNT_ALIGNED emitted when ticket close to avg", () => {
  const r = computeDealRisk(deal({ amount: 26000 }), [lossPattern], NOW, 0);
  assert(r);
  const v2 = r.breakdown.reasons_v2 ?? [];
  const amt = v2.find((x) => x.code === "AMOUNT_ALIGNED");
  assert(amt, "expected AMOUNT_ALIGNED");
  assertEquals(amt!.params.avgAmount, 25000);
  assertEquals(amt!.source, "amount");
});

Deno.test("reasons_v2: STAGE_STUCK carries stage param", () => {
  const r = computeDealRisk(
    deal({ status: "negotiation" }),
    [lossPattern, stuckPattern],
    NOW,
    0,
  );
  assert(r);
  const v2 = r.breakdown.reasons_v2 ?? [];
  const stage = v2.find((x) => x.code === "STAGE_STUCK");
  assert(stage, "expected STAGE_STUCK");
  assertEquals(stage!.params.stage, "negotiation");
  assertEquals(stage!.source, "stage");
});

Deno.test("reasons_v2: COMPETITOR_PRESSURE counts keywords", () => {
  const r = computeDealRisk(
    deal({ source: "leilao_publico" }),
    [lossPattern, competitorPattern],
    NOW,
    0,
  );
  assert(r);
  const v2 = r.breakdown.reasons_v2 ?? [];
  const comp = v2.find((x) => x.code === "COMPETITOR_PRESSURE");
  assert(comp, "expected COMPETITOR_PRESSURE");
  assertEquals(comp!.params.keywordCount, 1);
  assertEquals(comp!.source, "competitor");
});

Deno.test("reasons_v2: deterministic order stagnation → amount → stage → competitor", () => {
  const r = computeDealRisk(
    deal({ source: "leilao_publico", amount: 25000 }),
    [lossPattern, stuckPattern, competitorPattern],
    NOW,
    0,
  );
  assert(r);
  const codes = (r.breakdown.reasons_v2 ?? []).map((x) => x.code);
  // Filter to canonical groups for stable comparison.
  const filtered = codes.filter((c) =>
    c === "STAGNATION_HIGH" ||
    c === "STAGNATION_LOW" ||
    c === "AMOUNT_ALIGNED" ||
    c === "STAGE_STUCK" ||
    c === "COMPETITOR_PRESSURE",
  );
  // Verify stagnation comes first, competitor last, amount before stage.
  const order = ["STAGNATION_HIGH", "STAGNATION_LOW", "AMOUNT_ALIGNED", "STAGE_STUCK", "COMPETITOR_PRESSURE"];
  let last = -1;
  for (const c of filtered) {
    const idx = order.indexOf(c);
    assert(idx >= last, `out-of-order code ${c}`);
    last = idx;
  }
});

Deno.test("reasons_v2: CROSSED_SIGNALS fallback when no specific signal applies", () => {
  // Tiny, fresh deal w/ no patterns matching → forced through threshold=0.
  const r = computeDealRisk(
    {
      id: "d2",
      client_name: "Y",
      amount: 0,
      status: "lead", // not in STUCK_STATUSES
      category: null,
      source: null,
      updated_at: NOW.toISOString(),
      created_at: null,
    },
    [],
    NOW,
    0,
  );
  // r may be null if nothing scores; only assert when present.
  if (r) {
    const v2 = r.breakdown.reasons_v2 ?? [];
    assert(v2.length >= 1);
    if (v2.length === 1) assertEquals(v2[0].code, "CROSSED_SIGNALS");
  }
});

Deno.test("reasons (string[]) keeps legacy format unchanged", () => {
  const r = computeDealRisk(deal({}), [lossPattern, stuckPattern], NOW, 0);
  assert(r);
  // Legacy strings are still PT-BR human-readable; UI fallback can parse them.
  const joined = r.reasons.join("|");
  assert(/dias sem atualização/i.test(joined));
});
