import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeDealRisk } from "./scoring.ts";
import {
  DEAL_HISTORY_LSE_FIXTURES,
  LSE_INTENSITIES,
  LOSS_PATTERNS_REALISTIC,
  NOW,
  type DealHistoryLSEFamily,
} from "./fixtures.ts";
import { actionNeedles, includesCI, matchesPatternFamily } from "./_testHelpers.ts";

const RISK_THRESHOLD = 40;

for (const family of Object.keys(DEAL_HISTORY_LSE_FIXTURES) as DealHistoryLSEFamily[]) {
  const group = DEAL_HISTORY_LSE_FIXTURES[family];

  for (const intensity of LSE_INTENSITIES) {
    const c = group.cases[intensity];
    Deno.test(`LSE[${family}.${intensity}] — ${c.name}`, () => {
      const result = computeDealRisk(c.deal, LOSS_PATTERNS_REALISTIC, NOW);

      if (!c.expect.included) {
        const score = result?.risk_score ?? 0;
        assert(
          !result || score < RISK_THRESHOLD,
          `Expected excluded but got score=${score} action="${result?.suggested_action ?? ""}"`,
        );
        return;
      }

      assert(result, `Expected included but got null for ${c.name}`);
      const { risk_score, reasons, suggested_action, breakdown, matched_pattern } = result;

      assert(
        risk_score >= (c.expect.minScore ?? 0) && risk_score <= (c.expect.maxScore ?? 100),
        `Score ${risk_score} outside [${c.expect.minScore},${c.expect.maxScore}] for ${c.name}`,
      );

      if (c.expect.patternTypeOneOf) {
        assert(
          c.expect.patternTypeOneOf.includes(breakdown.matched_pattern_type ?? ""),
          `pattern_type=${breakdown.matched_pattern_type} not in ${c.expect.patternTypeOneOf.join(",")}`,
        );
      }

      if (c.expect.matchedPatternLabelIncludes) {
        const m = matchesPatternFamily(matched_pattern, c.expect.matchedPatternLabelIncludes);
        assert(
          m.ok,
          `matched_pattern="${matched_pattern}" missing "${c.expect.matchedPatternLabelIncludes}" ` +
            `(mode=${m.mode}, missingTokens=${JSON.stringify(m.missingTokens)})`,
        );
      }

      for (const needle of c.expect.reasonsInclude ?? []) {
        const hit = reasons.some((r) => includesCI(r, needle));
        assert(hit, `reason missing "${needle}" — got: ${reasons.join(" | ")}`);
      }

      const needles = actionNeedles(c.expect.actionIncludes);
      if (needles.length > 0) {
        const hit = needles.some((n) => includesCI(suggested_action ?? "", n));
        assert(hit, `action missing any of [${needles.join(", ")}] — got: ${suggested_action}`);
      }
    });
  }
}

Deno.test("LSE: catalog shape — pricing/negotiation/churn each expose light/strong/edge", () => {
  assertEquals(Object.keys(DEAL_HISTORY_LSE_FIXTURES).sort(), ["churn", "negotiation", "pricing"]);
  for (const family of Object.keys(DEAL_HISTORY_LSE_FIXTURES) as DealHistoryLSEFamily[]) {
    const group = DEAL_HISTORY_LSE_FIXTURES[family];
    assert(group.dominantPatternLabel.length > 0, `${family} missing dominantPatternLabel`);
    for (const intensity of LSE_INTENSITIES) {
      assert(group.cases[intensity], `${family}.${intensity} missing`);
    }
    assertEquals(group.cases.edge.expect.included, false, `${family}.edge must be excluded`);
    assertEquals(group.cases.light.expect.included, true, `${family}.light must be included`);
    assertEquals(group.cases.strong.expect.included, true, `${family}.strong must be included`);
  }
});

Deno.test("LSE meta-coverage: every group has ≥1 included AND ≥1 excluded/edge case", () => {
  const gaps: Array<{
    family: DealHistoryLSEFamily;
    included: number;
    excluded: number;
    intensities: { light: boolean; strong: boolean; edge: boolean };
    missing: string[];
  }> = [];

  for (const family of Object.keys(DEAL_HISTORY_LSE_FIXTURES) as DealHistoryLSEFamily[]) {
    const group = DEAL_HISTORY_LSE_FIXTURES[family];
    const cases = LSE_INTENSITIES.map((i) => group.cases[i]);
    const included = cases.filter((c) => c.expect.included).length;
    const excluded = cases.filter((c) => !c.expect.included).length;
    const intensities = {
      light: group.cases.light.expect.included === true,
      strong: group.cases.strong.expect.included === true,
      edge: group.cases.edge.expect.included === false,
    };
    const missing: string[] = [];
    if (included < 1) missing.push("needs ≥1 included case");
    if (excluded < 1) missing.push("needs ≥1 excluded/edge case");
    if (!intensities.light) missing.push("light must be included=true");
    if (!intensities.strong) missing.push("strong must be included=true");
    if (!intensities.edge) missing.push("edge must be included=false");

    if (missing.length > 0) {
      gaps.push({ family, included, excluded, intensities, missing });
    }
  }

  if (gaps.length > 0) {
    const diff = gaps
      .map(
        (g) =>
          `  ✗ [${g.family}] included=${g.included} excluded=${g.excluded} ` +
          `intensities=${JSON.stringify(g.intensities)}\n` +
          g.missing.map((m) => `      - ${m}`).join("\n"),
      )
      .join("\n");
    throw new Error(`LSE meta-coverage gaps:\n${diff}`);
  }
  assertEquals(gaps, []);
});

/**
 * Expected `matched_pattern_type` coverage per LSE family.
 *
 * This is a design contract — independent of `matchedPatternLabelIncludes` /
 * substring checks. It guarantees that:
 *   1. Every included fixture declares which dominant types are acceptable.
 *   2. The union of declared types across the family matches this set exactly
 *      (no silent drift if someone adds/removes a type from a single case).
 *   3. The engine actually emits a type within this set at runtime.
 *
 * If the engine legitimately starts emitting a new dominant type for a family
 * (e.g. "competitor" becomes first-class), update both the fixtures and this
 * map in the same change.
 */
const EXPECTED_LSE_PATTERN_TYPES: Record<DealHistoryLSEFamily, string[]> = {
  pricing: ["loss_factor"],
  negotiation: ["loss_factor", "stuck_stage"],
  churn: ["loss_factor"],
};

Deno.test("LSE meta-coverage: each group covers expected matched_pattern_type set (declared + runtime)", () => {
  const gaps: string[] = [];

  for (const family of Object.keys(DEAL_HISTORY_LSE_FIXTURES) as DealHistoryLSEFamily[]) {
    const group = DEAL_HISTORY_LSE_FIXTURES[family];
    const expected = new Set(EXPECTED_LSE_PATTERN_TYPES[family]);
    const declared = new Set<string>();
    const runtime = new Set<string>();
    const missingDeclaration: string[] = [];

    for (const intensity of LSE_INTENSITIES) {
      const c = group.cases[intensity];
      if (!c.expect.included) continue;

      // (1) Every included case must declare patternTypeOneOf.
      if (!c.expect.patternTypeOneOf?.length) {
        missingDeclaration.push(`${c.name} (intensity=${intensity})`);
        continue;
      }
      for (const t of c.expect.patternTypeOneOf) declared.add(t);

      // (3) Runtime engine emits a type within the expected set.
      const result = computeDealRisk(c.deal, LOSS_PATTERNS_REALISTIC, NOW);
      const actualType = result?.breakdown.matched_pattern_type ?? null;
      if (actualType) runtime.add(actualType);
      if (actualType && !expected.has(actualType)) {
        gaps.push(
          `[${family}/${c.name}] runtime type "${actualType}" not in expected set ` +
            `${JSON.stringify([...expected])}`,
        );
      }
    }

    if (missingDeclaration.length > 0) {
      gaps.push(
        `[${family}] included cases missing patternTypeOneOf declaration: ` +
          missingDeclaration.join(", "),
      );
    }

    // (2) Declared union must equal expected set (no extras, no omissions).
    const declaredArr = [...declared].sort();
    const expectedArr = [...expected].sort();
    const extra = declaredArr.filter((t) => !expected.has(t));
    const missing = expectedArr.filter((t) => !declared.has(t));
    if (extra.length > 0 || missing.length > 0) {
      gaps.push(
        `[${family}] declared patternTypeOneOf union mismatch:\n` +
          `      expected: ${JSON.stringify(expectedArr)}\n` +
          `      declared: ${JSON.stringify(declaredArr)}\n` +
          (extra.length > 0 ? `      unexpected extras: ${JSON.stringify(extra)}\n` : "") +
          (missing.length > 0 ? `      missing from fixtures: ${JSON.stringify(missing)}` : ""),
      );
    }
  }

  if (gaps.length > 0) {
    throw new Error(`LSE matched_pattern_type coverage gaps:\n  ✗ ${gaps.join("\n  ✗ ")}`);
  }
  assertEquals(gaps, []);
});
