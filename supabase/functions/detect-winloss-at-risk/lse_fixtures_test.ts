import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeDealRisk } from "./scoring.ts";
import {
  DEAL_HISTORY_LSE_FIXTURES,
  LSE_INTENSITIES,
  LOSS_PATTERNS_REALISTIC,
  NOW,
  type DealHistoryLSEFamily,
} from "./fixtures.ts";
import { evaluateActionIncludes, includesCI, includesNormalized, matchesPatternFamily } from "./_testHelpers.ts";

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
        const hit = reasons.some((r) => includesNormalized(r, needle));
        assert(hit, `reason missing "${needle}" — got: ${reasons.join(" | ")}`);
      }

      if (c.expect.actionIncludes !== undefined) {
        const ev = evaluateActionIncludes(suggested_action, c.expect.actionIncludes);
        assert(
          ev.ok,
          `action fails actionIncludes (${ev.reason}; missing=${JSON.stringify(ev.missing)}) — got: ${suggested_action}`,
        );
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
