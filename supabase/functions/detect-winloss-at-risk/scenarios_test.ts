/**
 * End-to-end scenario validation: each fixture deal goes through `computeDealRisk`
 * with the realistic pattern set and we assert that score, dominant pattern,
 * reasons and suggested action all make sense as a coherent story.
 */
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeAtRiskDeals, computeDealRisk } from "./scoring.ts";
import { LOSS_PATTERNS_REALISTIC, NOW, SCENARIOS } from "./fixtures.ts";
import { actionNeedles, hasMeaningfulActionIncludes, includesCI } from "./_testHelpers.ts";

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

    // Suggested action coherent (string = AND single needle; string[] = OR — any match)
    if (scenario.expect.actionIncludes !== undefined) {
      const needles = Array.isArray(scenario.expect.actionIncludes)
        ? scenario.expect.actionIncludes
        : [scenario.expect.actionIncludes];
      const hit = needles.some((n) => includesCI(r.suggested_action, n));
      assert(
        hit,
        `${scenario.name}: suggested_action "${r.suggested_action}" missing any of ${JSON.stringify(needles)}`,
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

Deno.test("scenarios: every included scenario declares a meaningful actionIncludes (anti-regression)", () => {
  // Forbid 3 silent failure modes on included scenarios:
  //   1. actionIncludes omitted entirely
  //   2. actionIncludes = []  (array passes truthy, but `some()` returns false → no assertion)
  //   3. actionIncludes = "" / "   "  (string passes truthy, but matches everything CI)
  const offenders = SCENARIOS
    .filter((s) => s.expect.included)
    .map((s) => {
      const a = s.expect.actionIncludes;
      if (a === undefined) return { name: s.name, reason: "missing" };
      if (!hasMeaningfulActionIncludes(a)) {
        return { name: s.name, reason: `empty (got ${JSON.stringify(a)})` };
      }
      return null;
    })
    .filter((x): x is { name: string; reason: string } => x !== null);
  assertEquals(
    offenders,
    [],
    `included scenarios with missing/empty actionIncludes (suggested_action coherence not asserted):\n  - ${offenders
      .map((o) => `${o.name}: ${o.reason}`)
      .join("\n  - ")}`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Tabular tests: load all fixtures at once and validate the entire table in
// aggregated assertions (better for at-a-glance review and bulk diagnostics).
// ─────────────────────────────────────────────────────────────────────────────

// `actionNeedles` is imported from `_testHelpers.ts` (single source of truth).

Deno.test("fixtures table: included flag matches threshold filter (40)", () => {
  const diff: Array<{ name: string; expected: boolean; got: boolean; score: number | null }> = [];
  for (const s of SCENARIOS) {
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    const gotIncluded = r !== null;
    if (gotIncluded !== s.expect.included) {
      diff.push({ name: s.name, expected: s.expect.included, got: gotIncluded, score: r?.risk_score ?? null });
    }
  }
  assertEquals(
    diff,
    [],
    `included-flag mismatches:\n${diff.map((d) => `  - ${d.name}: expected included=${d.expected}, got=${d.got} (score=${d.score})`).join("\n")}`,
  );
});

Deno.test("fixtures table: every included scenario respects minScore/maxScore + 0–100", () => {
  const violations: string[] = [];
  for (const s of SCENARIOS) {
    if (!s.expect.included) continue;
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    if (!r) {
      violations.push(`${s.name}: expected included but got null`);
      continue;
    }
    if (r.risk_score < 0 || r.risk_score > 100) {
      violations.push(`${s.name}: score ${r.risk_score} out of [0,100]`);
    }
    if (typeof s.expect.minScore === "number" && r.risk_score < s.expect.minScore) {
      violations.push(`${s.name}: score ${r.risk_score} < minScore ${s.expect.minScore}`);
    }
    if (typeof s.expect.maxScore === "number" && r.risk_score > s.expect.maxScore) {
      violations.push(`${s.name}: score ${r.risk_score} > maxScore ${s.expect.maxScore}`);
    }
  }
  assertEquals(violations, [], `score-band violations:\n  - ${violations.join("\n  - ")}`);
});

Deno.test("fixtures table: reasons & action substrings present per scenario", () => {
  const failures: string[] = [];
  for (const s of SCENARIOS) {
    if (!s.expect.included) continue;
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    if (!r) {
      failures.push(`${s.name}: expected included but got null`);
      continue;
    }
    // reasonsInclude → all needles must hit some reason (AND).
    for (const needle of s.expect.reasonsInclude ?? []) {
      const hit = r.reasons.some((reason) => includesCI(reason, needle));
      if (!hit) {
        failures.push(`${s.name}: reason needle "${needle}" not found in ${JSON.stringify(r.reasons)}`);
      }
    }
    // actionIncludes → string=AND single, array=OR (any match).
    const needles = actionNeedles(s.expect.actionIncludes);
    if (needles.length > 0) {
      const hit = needles.some((n) => includesCI(r.suggested_action, n));
      if (!hit) {
        failures.push(`${s.name}: action "${r.suggested_action}" missing any of ${JSON.stringify(needles)}`);
      }
    }
  }
  assertEquals(failures, [], `reasons/action substring failures:\n  - ${failures.join("\n  - ")}`);
});

Deno.test("fixtures table: excluded scenarios stay below threshold even at threshold=0", () => {
  const violations: string[] = [];
  for (const s of SCENARIOS) {
    if (s.expect.included) continue;
    // threshold=0 → never returns null due to filter; only null if no signals at all.
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 0);
    const score = r?.risk_score ?? 0;
    if (score >= 40) {
      violations.push(`${s.name}: excluded but score ${score} >= 40 at threshold=0 (would leak in)`);
    }
  }
  assertEquals(violations, [], `excluded-but-leaky scenarios:\n  - ${violations.join("\n  - ")}`);
});
