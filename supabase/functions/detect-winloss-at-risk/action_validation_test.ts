import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeDealRisk,
  ensureNonEmpty,
  severityFromScore,
  suggestedActionFor,
  type LossPattern,
  type OpenDeal,
} from "./scoring.ts";
import { LOSS_PATTERNS_REALISTIC, NOW, SCENARIOS } from "./fixtures.ts";

const URGENCY_RE = /imediata|urgente|24h|hoje/i;

Deno.test("severityFromScore: truth table for 4 levels", () => {
  assertEquals(severityFromScore(85, 0.8), "critical");
  assertEquals(severityFromScore(85, 0.6), "high"); // low confidence demotes
  assertEquals(severityFromScore(70, 0.9), "high");
  assertEquals(severityFromScore(55, 0.9), "medium");
  assertEquals(severityFromScore(42, 0.9), "low");
});

Deno.test("ensureNonEmpty: trims, falls back on empty/whitespace", () => {
  assertEquals(ensureNonEmpty("  hello  ", "fb"), "hello");
  assertEquals(ensureNonEmpty("", "fb"), "fb");
  assertEquals(ensureNonEmpty("   ", "fb"), "fb");
  assertEquals(ensureNonEmpty(null, "fb"), "fb");
  assertEquals(ensureNonEmpty(undefined, "fb"), "fb");
});

Deno.test("matched_pattern is never empty even when pattern label is blank", () => {
  const blankPatterns: LossPattern[] = [
    {
      pattern_type: "loss_factor",
      label: "   ", // whitespace only
      outcome: "lost",
      frequency: 10,
      win_rate: 0.1,
      avg_cycle_days: 30,
      avg_amount: 25000,
      confidence: 0.8,
    },
    {
      pattern_type: "stuck_stage",
      label: "",
      outcome: "lost",
      frequency: 8,
      win_rate: 0.15,
      avg_cycle_days: 30,
      avg_amount: 20000,
      confidence: 0.75,
    },
  ];
  const deal: OpenDeal = {
    id: "blank1",
    client_name: "X",
    amount: 25000,
    status: "negotiation",
    category: null,
    source: null,
    updated_at: new Date(NOW.getTime() - 50 * 86_400_000).toISOString(),
    created_at: null,
  };
  const r = computeDealRisk(deal, blankPatterns, NOW, 40);
  assert(r);
  assert(r.matched_pattern.trim().length > 0, `matched_pattern empty: "${r.matched_pattern}"`);
  assert(/Sinal de risco/i.test(r.matched_pattern));
  assertEquals(r.matched_pattern, r.breakdown.matched_pattern_label);
});

Deno.test("suggested_action: never empty nor < 15 chars across all fixture scenarios", () => {
  for (const s of SCENARIOS) {
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 0);
    if (!r) continue;
    assert(
      r.suggested_action.trim().length >= 15,
      `scenario ${s.name}: action too short ("${r.suggested_action}")`,
    );
    assert(r.matched_pattern.trim().length > 0, `scenario ${s.name}: matched_pattern empty`);
  }
});

Deno.test("loss_factor + critical severity contains urgency marker", () => {
  const action = suggestedActionFor("loss_factor", "negotiation", {
    outcome: "lost",
    severity: "critical",
  });
  assert(URGENCY_RE.test(action), `expected urgency marker in: "${action}"`);
});

Deno.test("loss_factor + medium severity has NO urgency marker (avoid wolf-crying)", () => {
  const action = suggestedActionFor("loss_factor", "negotiation", {
    outcome: "lost",
    severity: "medium",
  });
  assert(!URGENCY_RE.test(action), `unexpected urgency marker in medium: "${action}"`);
});

Deno.test("win_factor / outcome=won produces positive action with no urgency", () => {
  const sevs: Array<"low" | "medium" | "high" | "critical"> = ["low", "medium", "high", "critical"];
  for (const sev of sevs) {
    const a = suggestedActionFor("win_factor", "qualified", { outcome: "won", severity: sev });
    assert(/reaplicar|reforçar|replicar|vencedor/i.test(a), `not positive: "${a}" (sev=${sev})`);
    assert(!URGENCY_RE.test(a), `win action should not be urgent: "${a}" (sev=${sev})`);
  }
  // outcome=won should override even loss-style pattern types
  const aOverride = suggestedActionFor("loss_factor", "qualified", {
    outcome: "won",
    severity: "critical",
  });
  assert(/reaplicar|vencedor/i.test(aOverride), `won override failed: "${aOverride}"`);
});

Deno.test("unknown pattern type with blank label still falls back deterministically", () => {
  const blankUnknown: LossPattern[] = [
    {
      pattern_type: "unknown_type",
      label: "   ",
      outcome: "lost",
      frequency: 5,
      win_rate: 0.1,
      avg_cycle_days: 30,
      avg_amount: 20000,
      confidence: 0.6,
    },
  ];
  const deal: OpenDeal = {
    id: "unk1",
    client_name: "Y",
    amount: 20000,
    status: "proposal",
    category: null,
    source: null,
    updated_at: new Date(NOW.getTime() - 60 * 86_400_000).toISOString(),
    created_at: null,
  };
  const r = computeDealRisk(deal, blankUnknown, NOW, 40);
  if (r) {
    assert(r.matched_pattern.trim().length > 0);
    assert(r.suggested_action.trim().length >= 15);
  }
});
