/**
 * End-to-end contract for severity=critical:
 *   The suggested action MUST contain at least one of the canonical imperative
 *   tokens — "URGENTE" (stuck_stage critical) or "IMEDIATA" (loss_factor critical).
 *
 * Also asserts the universe of imperative tokens emitted across critical branches
 * so a future tone-down regression is caught at the matrix level.
 */
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeDealRisk, suggestedActionFor } from "./scoring.ts";
import { LOSS_PATTERNS_REALISTIC, NOW, SCENARIOS } from "./fixtures.ts";

const IMPERATIVE_RE = /URGENTE|IMEDIATA/;

Deno.test("critical_imperative_tokens_e2e: scenario emits URGENTE or IMEDIATA end-to-end", () => {
  const scenario = SCENARIOS.find((s) => s.name === "critical_imperative_tokens_e2e");
  assert(scenario, "fixture critical_imperative_tokens_e2e missing");

  const r = computeDealRisk(scenario!.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
  assert(r, "expected scenario to be included");
  assert(
    r!.risk_score >= 80,
    `expected severity=critical (score ≥ 80), got ${r!.risk_score}`,
  );
  assert(
    IMPERATIVE_RE.test(r!.suggested_action),
    `critical action missing imperative token (URGENTE/IMEDIATA): "${r!.suggested_action}"`,
  );
});

Deno.test("critical severity: loss_factor branch emits IMEDIATA, stuck_stage emits URGENTE", () => {
  const lossAction = suggestedActionFor("loss_factor", "negotiation", {
    severity: "critical",
    outcome: "lost",
  });
  assert(/IMEDIATA/.test(lossAction), `loss_factor critical missing IMEDIATA: "${lossAction}"`);

  const stuckAction = suggestedActionFor("stuck_stage", "negotiation", {
    severity: "critical",
    outcome: "lost",
  });
  assert(/URGENTE/.test(stuckAction), `stuck_stage critical missing URGENTE: "${stuckAction}"`);
});
