/**
 * End-to-end scenario validation: each fixture deal goes through `computeDealRisk`
 * with the realistic pattern set and we assert that score, dominant pattern,
 * reasons and suggested action all make sense as a coherent story.
 */
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeAtRiskDeals, computeDealRisk } from "./scoring.ts";
import { LOSS_PATTERNS_REALISTIC, NOW, SCENARIOS } from "./fixtures.ts";

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

for (const scenario of SCENARIOS) {
  Deno.test(`scenario: ${scenario.name} — ${scenario.story}`, () => {
    const result = computeDealRisk(scenario.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);

    if (!scenario.expect.included) {
      assertEquals(
        result,
        null,
        `expected scenario "${scenario.name}" to be filtered out, got score ${result?.risk_score}`,
      );
      return;
    }

    assert(result !== null, `scenario "${scenario.name}" should produce a result`);
    const r = result!;

    // Score band
    if (typeof scenario.expect.minScore === "number") {
      assert(
        r.risk_score >= scenario.expect.minScore,
        `${scenario.name}: risk_score ${r.risk_score} < min ${scenario.expect.minScore}`,
      );
    }
    if (typeof scenario.expect.maxScore === "number") {
      assert(
        r.risk_score <= scenario.expect.maxScore,
        `${scenario.name}: risk_score ${r.risk_score} > max ${scenario.expect.maxScore}`,
      );
    }

    // Score is always within the global 0–100 range
    assert(r.risk_score >= 0 && r.risk_score <= 100, `${scenario.name}: score out of [0,100]`);

    // Dominant pattern type
    if (scenario.expect.patternTypeOneOf?.length) {
      assert(
        scenario.expect.patternTypeOneOf.includes(r.breakdown.matched_pattern_type),
        `${scenario.name}: matched_pattern_type "${r.breakdown.matched_pattern_type}" not in ${JSON.stringify(scenario.expect.patternTypeOneOf)}`,
      );
    }

    // Reasons include all required substrings
    for (const needle of scenario.expect.reasonsInclude ?? []) {
      const hit = r.reasons.some((reason) => includesCI(reason, needle));
      assert(
        hit,
        `${scenario.name}: no reason includes "${needle}". Reasons: ${JSON.stringify(r.reasons)}`,
      );
    }

    // Suggested action coherent
    if (scenario.expect.actionIncludes) {
      assert(
        includesCI(r.suggested_action, scenario.expect.actionIncludes),
        `${scenario.name}: suggested_action "${r.suggested_action}" missing "${scenario.expect.actionIncludes}"`,
      );
    }

    // Sanity: every included scenario has a non-empty reason list and non-empty action
    assert(r.reasons.length > 0, `${scenario.name}: reasons should not be empty`);
    assert(r.suggested_action.length > 10, `${scenario.name}: suggested_action too short`);
    assert(r.matched_pattern.length > 0, `${scenario.name}: matched_pattern label empty`);
  });
}

Deno.test("scenarios: computeAtRiskDeals sorts desc, filters <40, respects limit", () => {
  const allDeals = SCENARIOS.map((s) => s.deal);
  const out = computeAtRiskDeals(allDeals, LOSS_PATTERNS_REALISTIC, NOW, { threshold: 40, limit: 50 });

  // Every returned deal is above threshold
  for (const r of out) {
    assert(r.risk_score >= 40, `included deal ${r.sale_id} has score ${r.risk_score} < 40`);
  }

  // Sorted desc
  for (let i = 1; i < out.length; i += 1) {
    assert(
      out[i - 1].risk_score >= out[i].risk_score,
      `not sorted desc at index ${i}: ${out[i - 1].risk_score} < ${out[i].risk_score}`,
    );
  }

  // Count matches the included-flag fixtures
  const expectedIncluded = SCENARIOS.filter((s) => s.expect.included).length;
  assertEquals(
    out.length,
    expectedIncluded,
    `expected ${expectedIncluded} included scenarios, got ${out.length} (ids: ${out.map((d) => d.sale_id).join(",")})`,
  );

  // Limit is respected
  const limited = computeAtRiskDeals(allDeals, LOSS_PATTERNS_REALISTIC, NOW, { threshold: 40, limit: 3 });
  assert(limited.length <= 3);
});
