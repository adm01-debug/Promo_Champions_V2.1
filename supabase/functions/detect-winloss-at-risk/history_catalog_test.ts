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
import { actionNeedles, evaluateActionIncludes, hasMeaningfulActionIncludes, includesCI, matchesPatternFamily } from "./_testHelpers.ts";

const FAMILIES = Object.keys(DEAL_HISTORY_FIXTURES) as DealHistoryFamily[];

interface CaseReport {
  family: DealHistoryFamily;
  name: string;
  expected: { included: boolean; minScore?: number; maxScore?: number };
  got: {
    included: boolean;
    score: number | null;
    matched_pattern: string | null;
    matched_pattern_type: string | null;
    reasons: string[];
    suggested_action: string | null;
  };
  failures: string[];
}

function buildCaseReport(family: DealHistoryFamily, group: ScenarioGroup, c: ScenarioGroup["cases"][number]): CaseReport {
  const r = computeDealRisk(c.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
  const gotIncluded = r !== null;
  const failures: string[] = [];
  const report: CaseReport = {
    family,
    name: c.name,
    expected: { included: c.expect.included, minScore: c.expect.minScore, maxScore: c.expect.maxScore },
    got: {
      included: gotIncluded,
      score: r?.risk_score ?? null,
      matched_pattern: r?.matched_pattern ?? null,
      matched_pattern_type: r?.breakdown.matched_pattern_type ?? null,
      reasons: r?.reasons ?? [],
      suggested_action: r?.suggested_action ?? null,
    },
    failures,
  };

  if (gotIncluded !== c.expect.included) {
    failures.push(
      `included flag mismatch: expected=${c.expect.included}, got=${gotIncluded} (score=${r?.risk_score ?? "n/a"})`,
    );
    return report;
  }
  if (!c.expect.included || !r) return report;

  // Score band + global [0,100]
  if (r.risk_score < 0 || r.risk_score > 100) {
    failures.push(`score ${r.risk_score} out of [0,100]`);
  }
  if (typeof c.expect.minScore === "number" && r.risk_score < c.expect.minScore) {
    failures.push(`score ${r.risk_score} < minScore ${c.expect.minScore}`);
  }
  if (typeof c.expect.maxScore === "number" && r.risk_score > c.expect.maxScore) {
    failures.push(`score ${r.risk_score} > maxScore ${c.expect.maxScore}`);
  }

  if (c.expect.patternTypeOneOf?.length && !c.expect.patternTypeOneOf.includes(r.breakdown.matched_pattern_type)) {
    failures.push(
      `pattern_type "${r.breakdown.matched_pattern_type}" not in ${JSON.stringify(c.expect.patternTypeOneOf)}`,
    );
  }

  const expectedLabel = c.expect.matchedPatternLabelIncludes ?? group.dominantPatternLabel;
  if (expectedLabel) {
    const m = matchesPatternFamily(r.matched_pattern, expectedLabel);
    if (!m.ok) {
      failures.push(
        `matched_pattern "${r.matched_pattern}" missing family label "${expectedLabel}" ` +
          `(mode=${m.mode}, missingTokens=${JSON.stringify(m.missingTokens)})`,
      );
    }
  }

  for (const needle of c.expect.reasonsInclude ?? []) {
    const hit = r.reasons.some((reason) => includesNormalized(reason, needle));
    if (!hit) {
      failures.push(`reason needle "${needle}" not found in ${JSON.stringify(r.reasons)}`);
    }
  }

  if (c.expect.actionIncludes !== undefined) {
    const ev = evaluateActionIncludes(r.suggested_action, c.expect.actionIncludes);
    if (!ev.ok) {
      failures.push(
        `action "${r.suggested_action}" fails actionIncludes (${ev.reason}; missing=${JSON.stringify(ev.missing)})`,
      );
    }
  }

  return report;
}

function validateGroup(family: DealHistoryFamily, group: ScenarioGroup): CaseReport[] {
  return group.cases.map((c) => buildCaseReport(family, group, c));
}

function formatReport(reports: CaseReport[]): string {
  const lines: string[] = [];
  for (const r of reports) {
    const status = r.failures.length === 0 ? "✓" : "✗";
    lines.push(
      `${status} [${r.family}/${r.name}] included=${r.got.included} score=${r.got.score ?? "n/a"} ` +
        `pattern="${r.got.matched_pattern ?? ""}" type=${r.got.matched_pattern_type ?? "n/a"}`,
    );
    if (r.got.suggested_action) lines.push(`     action: ${r.got.suggested_action}`);
    if (r.got.reasons.length) lines.push(`     reasons: ${r.got.reasons.join(" | ")}`);
    for (const f of r.failures) lines.push(`     ✗ ${f}`);
  }
  return lines.join("\n");
}

function reportArtifact(family: DealHistoryFamily, reports: CaseReport[]): string {
  const failed = reports.filter((r) => r.failures.length > 0);
  const json = JSON.stringify(
    { family, total: reports.length, failed: failed.length, cases: reports },
    null,
    2,
  );
  return `\n=== history_catalog report [${family}] — ${failed.length}/${reports.length} failed ===\n` +
    formatReport(reports) +
    `\n--- JSON ---\n${json}\n=== end report ===`;
}

// One Deno.test per family — easy to spot which family broke when something fails.
// On failure we emit a per-case report (text + JSON) covering score, matched_pattern,
// reasons and suggested_action — makes catalog regressions self-explanatory.
for (const family of FAMILIES) {
  const group = DEAL_HISTORY_FIXTURES[family];
  Deno.test(`history catalog: ${family} — "${group.theme}" (dominant: "${group.dominantPatternLabel}")`, () => {
    const reports = validateGroup(family, group);
    const failedCases = reports.filter((r) => r.failures.length > 0);
    if (failedCases.length > 0) {
      const flat = failedCases.flatMap((r) => r.failures.map((f) => `[${r.family}/${r.name}] ${f}`));
      assertEquals(flat, [], reportArtifact(family, reports));
    }
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
