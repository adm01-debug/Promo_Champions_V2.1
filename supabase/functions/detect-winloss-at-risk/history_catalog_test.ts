/**
 * History-driven catalog validation. For each family in `DEAL_HISTORY_FIXTURES`
 * (preço, negociação, churn, competitiva, won-style), verify that:
 *   - Included cases land in [minScore, maxScore] ⊂ [0,100].
 *   - `matched_pattern` carries the family's dominant label (when scenario opts in).
 *   - reasonsInclude (AND) and actionIncludes (string=AND-single, array=OR) hit.
 *   - Excluded cases stay below threshold even when `threshold=0`.
 *   - Each family has ≥1 included case AND ≥1 excluded/borderline case.
 */
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeDealRisk } from "./scoring.ts";
import { DEAL_HISTORY_FIXTURES, LOSS_PATTERNS_REALISTIC, NOW, type DealHistoryFamily, type ScenarioGroup } from "./fixtures.ts";
import { actionNeedles, hasMeaningfulActionIncludes, includesCI } from "./_testHelpers.ts";

const FAMILIES = Object.keys(DEAL_HISTORY_FIXTURES) as DealHistoryFamily[];

function validateGroup(family: DealHistoryFamily, group: ScenarioGroup): string[] {
  const failures: string[] = [];
  for (const c of group.cases) {
    // Use threshold=40 so the included flag mirrors the prod default.
    const r = computeDealRisk(c.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    const gotIncluded = r !== null;

    if (gotIncluded !== c.expect.included) {
      failures.push(
        `[${family}/${c.name}] included flag mismatch: expected=${c.expect.included}, got=${gotIncluded} (score=${r?.risk_score ?? "n/a"})`,
      );
      continue;
    }
    if (!c.expect.included) continue; // excluded case checked separately below

    if (!r) continue;

    // Score band + global [0,100]
    if (r.risk_score < 0 || r.risk_score > 100) {
      failures.push(`[${family}/${c.name}] score ${r.risk_score} out of [0,100]`);
    }
    if (typeof c.expect.minScore === "number" && r.risk_score < c.expect.minScore) {
      failures.push(`[${family}/${c.name}] score ${r.risk_score} < minScore ${c.expect.minScore}`);
    }
    if (typeof c.expect.maxScore === "number" && r.risk_score > c.expect.maxScore) {
      failures.push(`[${family}/${c.name}] score ${r.risk_score} > maxScore ${c.expect.maxScore}`);
    }

    // Pattern type
    if (c.expect.patternTypeOneOf?.length && !c.expect.patternTypeOneOf.includes(r.breakdown.matched_pattern_type)) {
      failures.push(
        `[${family}/${c.name}] pattern_type "${r.breakdown.matched_pattern_type}" not in ${JSON.stringify(c.expect.patternTypeOneOf)}`,
      );
    }

    // Family-level dominant pattern label (matchedPatternLabelIncludes overrides group default).
    const expectedLabel = c.expect.matchedPatternLabelIncludes ?? group.dominantPatternLabel;
    if (expectedLabel && !includesCI(r.matched_pattern, expectedLabel)) {
      failures.push(
        `[${family}/${c.name}] matched_pattern "${r.matched_pattern}" missing family label "${expectedLabel}"`,
      );
    }

    // Reasons
    for (const needle of c.expect.reasonsInclude ?? []) {
      const hit = r.reasons.some((reason) => includesCI(reason, needle));
      if (!hit) {
        failures.push(
          `[${family}/${c.name}] reason needle "${needle}" not found in ${JSON.stringify(r.reasons)}`,
        );
      }
    }

    // Action substrings (string=single AND, array=OR)
    const needles = actionNeedles(c.expect.actionIncludes);
    if (needles.length > 0) {
      const hit = needles.some((n) => includesCI(r.suggested_action, n));
      if (!hit) {
        failures.push(
          `[${family}/${c.name}] action "${r.suggested_action}" missing any of ${JSON.stringify(needles)}`,
        );
      }
    }
  }
  return failures;
}

// One Deno.test per family — easy to spot which family broke when something fails.
for (const family of FAMILIES) {
  const group = DEAL_HISTORY_FIXTURES[family];
  Deno.test(`history catalog: ${family} — "${group.theme}" (dominant: "${group.dominantPatternLabel}")`, () => {
    const failures = validateGroup(family, group);
    assertEquals(failures, [], `family "${family}" failures:\n  - ${failures.join("\n  - ")}`);
  });
}

Deno.test("history catalog: excluded cases stay below threshold even at threshold=0", () => {
  const violations: string[] = [];
  for (const family of FAMILIES) {
    const group = DEAL_HISTORY_FIXTURES[family];
    for (const c of group.cases) {
      if (c.expect.included) continue;
      const r = computeDealRisk(c.deal, LOSS_PATTERNS_REALISTIC, NOW, 0);
      const score = r?.risk_score ?? 0;
      if (score >= 40) {
        violations.push(`[${family}/${c.name}] excluded but score ${score} >= 40 (would leak in)`);
      }
    }
  }
  assertEquals(violations, [], `excluded-but-leaky:\n  - ${violations.join("\n  - ")}`);
});

Deno.test("history catalog: every family has ≥1 included AND ≥1 excluded case", () => {
  const gaps: string[] = [];
  for (const family of FAMILIES) {
    const group = DEAL_HISTORY_FIXTURES[family];
    const included = group.cases.filter((c) => c.expect.included).length;
    const excluded = group.cases.filter((c) => !c.expect.included).length;
    if (family === "winning") {
      // winning é exclusivamente "não-risco" — só precisa ter ≥2 excluídos.
      if (excluded < 2) gaps.push(`${family}: needs ≥2 excluded, got ${excluded}`);
    } else {
      if (included < 1) gaps.push(`${family}: needs ≥1 included, got 0`);
      if (excluded < 1) gaps.push(`${family}: needs ≥1 excluded/borderline, got 0`);
    }
  }
  assertEquals(gaps, [], `coverage gaps:\n  - ${gaps.join("\n  - ")}`);
});

Deno.test("history catalog: every included case declares minScore, maxScore and matchedPatternLabelIncludes (or inherits group default)", () => {
  const missing: string[] = [];
  for (const family of FAMILIES) {
    const group = DEAL_HISTORY_FIXTURES[family];
    for (const c of group.cases) {
      if (!c.expect.included) continue;
      if (typeof c.expect.minScore !== "number") missing.push(`[${family}/${c.name}] missing minScore`);
      if (typeof c.expect.maxScore !== "number") missing.push(`[${family}/${c.name}] missing maxScore`);
      // Either explicit override or group default must be non-empty.
      const label = c.expect.matchedPatternLabelIncludes ?? group.dominantPatternLabel;
      if (!label) missing.push(`[${family}/${c.name}] missing matchedPatternLabelIncludes (no group default)`);
    }
  }
  assertEquals(missing, [], `metadata gaps:\n  - ${missing.join("\n  - ")}`);
});

Deno.test("history catalog: every included case declares a meaningful actionIncludes (anti-regression)", () => {
  // Mirrors the SCENARIOS-level guard: forbids `undefined`, `[]` and empty/whitespace strings,
  // which would otherwise silently bypass the substring assertion in `validateGroup`.
  const offenders: string[] = [];
  for (const family of FAMILIES) {
    const group = DEAL_HISTORY_FIXTURES[family];
    for (const c of group.cases) {
      if (!c.expect.included) continue;
      const a = c.expect.actionIncludes;
      if (a === undefined) {
        offenders.push(`[${family}/${c.name}] missing actionIncludes`);
        continue;
      }
      if (!hasMeaningfulActionIncludes(a)) {
        offenders.push(`[${family}/${c.name}] empty actionIncludes (got ${JSON.stringify(a)})`);
      }
    }
  }
  assertEquals(
    offenders,
    [],
    `included cases with missing/empty actionIncludes:\n  - ${offenders.join("\n  - ")}`,
  );
});

Deno.test("_testHelpers: hasMeaningfulActionIncludes rejects undefined / [] / empty strings", () => {
  // Self-test of the guard so a future refactor of the helper can't silently
  // weaken the anti-regression check above.
  assertEquals(hasMeaningfulActionIncludes(undefined), false);
  assertEquals(hasMeaningfulActionIncludes([]), false);
  assertEquals(hasMeaningfulActionIncludes(""), false);
  assertEquals(hasMeaningfulActionIncludes("   "), false);
  assertEquals(hasMeaningfulActionIncludes(["", "  "]), false);
  assertEquals(hasMeaningfulActionIncludes("valor"), true);
  assertEquals(hasMeaningfulActionIncludes(["", "valor"]), true);
  assertEquals(actionNeedles(["", "valor", "  ", "ROI"]), ["valor", "ROI"]);
});
