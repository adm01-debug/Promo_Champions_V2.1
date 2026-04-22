/**
 * End-to-end scenario validation: each fixture deal goes through `computeDealRisk`
 * with the realistic pattern set and we assert that score, dominant pattern,
 * reasons and suggested action all make sense as a coherent story.
 */
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { computeAtRiskDeals, computeDealRisk, severityFromScore } from "./scoring.ts";
import { LOSS_PATTERNS_REALISTIC, NOW, SCENARIOS } from "./fixtures.ts";
import { actionNeedles, evaluateActionIncludes, hasMeaningfulActionIncludes, includesCI, includesNormalized } from "./_testHelpers.ts";

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
      const hit = r.reasons.some((reason) => includesNormalized(reason, needle));
      assert(
        hit,
        `${scenario.name}: no reason includes "${needle}". Reasons: ${JSON.stringify(r.reasons)}`,
      );
    }

    // Suggested action coherent — supports string (AND), string[] (OR) and { all, anyOf? } (AND+OR).
    if (scenario.expect.actionIncludes !== undefined) {
      const evalRes = evaluateActionIncludes(r.suggested_action, scenario.expect.actionIncludes);
      assert(
        evalRes.ok,
        [
          `${scenario.name}: suggested_action does not satisfy actionIncludes (${evalRes.reason}).`,
          `  score=${r.risk_score} severity=${r.breakdown.severity ?? severityFromScore(r.risk_score, r.breakdown.matched_confidence)} dominant=${r.breakdown.matched_pattern_type} label="${r.matched_pattern}"`,
          `  expected         : ${JSON.stringify(scenario.expect.actionIncludes)}`,
          `  matched          : ${JSON.stringify(evalRes.matched)}`,
          `  missing          : ${JSON.stringify(evalRes.missing)}`,
          `  actual action    : "${r.suggested_action}"`,
          `  reasons sample   : ${JSON.stringify(r.reasons.slice(0, 3))}`,
        ].join("\n"),
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
  const diff: Array<{
    name: string;
    expected: boolean;
    got: boolean;
    score: number | null;
    severity: string | null;
    dominant: string | null;
  }> = [];
  for (const s of SCENARIOS) {
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    const gotIncluded = r !== null;
    if (gotIncluded !== s.expect.included) {
      diff.push({
        name: s.name,
        expected: s.expect.included,
        got: gotIncluded,
        score: r?.risk_score ?? null,
        severity: r
          ? (r.breakdown.severity ?? severityFromScore(r.risk_score, r.breakdown.matched_confidence))
          : null,
        dominant: r?.breakdown.matched_pattern_type ?? null,
      });
    }
  }
  assertEquals(
    diff,
    [],
    `included-flag mismatches (${diff.length}):\n${diff
      .map(
        (d) =>
          `  - ${d.name}\n      expected included = ${d.expected}\n      got included      = ${d.got}\n      score             = ${d.score}\n      severity          = ${d.severity}\n      dominant          = ${d.dominant}`,
      )
      .join("\n")}`,
  );
});

Deno.test("fixtures table: every included scenario respects minScore/maxScore + 0–100", () => {
  type ScoreFailure = {
    name: string;
    score: number | null;
    minScore: number | null;
    maxScore: number | null;
    severity: string | null;
    dominant: string | null;
    note: string;
  };
  const violations: ScoreFailure[] = [];
  for (const s of SCENARIOS) {
    if (!s.expect.included) continue;
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    const minScore = s.expect.minScore ?? null;
    const maxScore = s.expect.maxScore ?? null;
    if (!r) {
      violations.push({
        name: s.name,
        score: null,
        minScore,
        maxScore,
        severity: null,
        dominant: null,
        note: "expected included but got null",
      });
      continue;
    }
    const ctx = {
      score: r.risk_score,
      severity: (r.breakdown.severity ?? severityFromScore(r.risk_score, r.breakdown.matched_confidence)),
      dominant: r.breakdown.matched_pattern_type,
    };
    if (r.risk_score < 0 || r.risk_score > 100) {
      violations.push({ name: s.name, ...ctx, minScore, maxScore, note: "out of [0,100]" });
    }
    if (typeof minScore === "number" && r.risk_score < minScore) {
      violations.push({
        name: s.name,
        ...ctx,
        minScore,
        maxScore,
        note: `score ${r.risk_score} < minScore ${minScore} (gap=${minScore - r.risk_score})`,
      });
    }
    if (typeof maxScore === "number" && r.risk_score > maxScore) {
      violations.push({
        name: s.name,
        ...ctx,
        minScore,
        maxScore,
        note: `score ${r.risk_score} > maxScore ${maxScore} (overshoot=${r.risk_score - maxScore})`,
      });
    }
  }
  assertEquals(
    violations,
    [],
    `score-band violations (${violations.length}):\n${violations
      .map(
        (v) =>
          `  - ${v.name}\n      band              = [${v.minScore ?? "—"}, ${v.maxScore ?? "—"}]\n      actual score      = ${v.score}\n      severity          = ${v.severity}\n      dominant          = ${v.dominant}\n      issue             = ${v.note}`,
      )
      .join("\n")}`,
  );
});

Deno.test("fixtures table: reasons & action substrings present per scenario", () => {
  type SubstringFailure = {
    name: string;
    kind: "reasons" | "action" | "null-result";
    score: number | null;
    severity: string | null;
    dominant: string | null;
    expected: string[];
    matched: string[];
    actual: string;
    sample: string[];
  };
  const failures: SubstringFailure[] = [];
  for (const s of SCENARIOS) {
    if (!s.expect.included) continue;
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    if (!r) {
      failures.push({
        name: s.name,
        kind: "null-result",
        score: null,
        severity: null,
        dominant: null,
        expected: [],
        matched: [],
        actual: "(null)",
        sample: [],
      });
      continue;
    }
    const ctx = {
      score: r.risk_score,
      severity: (r.breakdown.severity ?? severityFromScore(r.risk_score, r.breakdown.matched_confidence)),
      dominant: r.breakdown.matched_pattern_type,
    };
    // reasonsInclude → all needles must hit some reason (AND).
    const reasonNeedles = s.expect.reasonsInclude ?? [];
    const reasonMissing = reasonNeedles.filter(
      (needle) => !r.reasons.some((reason) => includesNormalized(reason, needle)),
    );
    if (reasonMissing.length > 0) {
      failures.push({
        name: s.name,
        kind: "reasons",
        ...ctx,
        expected: reasonNeedles,
        matched: reasonNeedles.filter((n) => !reasonMissing.includes(n)),
        actual: `[${r.reasons.length} reasons]`,
        sample: r.reasons.slice(0, 5),
      });
    }
    // actionIncludes → string (AND), string[] (OR), or { all, anyOf? } (AND+OR).
    if (s.expect.actionIncludes !== undefined) {
      const evalRes = evaluateActionIncludes(r.suggested_action, s.expect.actionIncludes);
      if (!evalRes.ok) {
        failures.push({
          name: s.name,
          kind: "action",
          ...ctx,
          expected: actionNeedles(s.expect.actionIncludes),
          matched: evalRes.matched,
          actual: `${r.suggested_action} | ${evalRes.reason}`,
          sample: r.reasons.slice(0, 3),
        });
      }
    }
  }
  assertEquals(
    failures,
    [],
    `reasons/action substring failures (${failures.length}):\n${failures
      .map(
        (f) =>
          `  - ${f.name} [${f.kind}]\n      score=${f.score} severity=${f.severity} dominant=${f.dominant}\n      expected (${f.kind === "reasons" ? "ALL of" : "ANY of"}): ${JSON.stringify(f.expected)}\n      matched          : ${JSON.stringify(f.matched)}\n      missing          : ${JSON.stringify(f.expected.filter((e) => !f.matched.includes(e)))}\n      actual           : ${f.kind === "action" ? `"${f.actual}"` : f.actual}\n      sample           : ${JSON.stringify(f.sample)}`,
      )
      .join("\n")}`,
  );
});

Deno.test("fixtures table: excluded scenarios stay below threshold even at threshold=0", () => {
  type LeakFailure = {
    name: string;
    score: number;
    severity: string;
    dominant: string;
    actionPreview: string;
  };
  const violations: LeakFailure[] = [];
  for (const s of SCENARIOS) {
    if (s.expect.included) continue;
    // threshold=0 → never returns null due to filter; only null if no signals at all.
    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 0);
    const score = r?.risk_score ?? 0;
    if (score >= 40) {
      violations.push({
        name: s.name,
        score,
        severity: r
          ? (r.breakdown.severity ?? severityFromScore(r.risk_score, r.breakdown.matched_confidence))
          : "—",
        dominant: r?.breakdown.matched_pattern_type ?? "—",
        actionPreview: r?.suggested_action.slice(0, 80) ?? "—",
      });
    }
  }
  assertEquals(
    violations,
    [],
    `excluded-but-leaky scenarios (${violations.length}):\n${violations
      .map(
        (v) =>
          `  - ${v.name}\n      score             = ${v.score} (>= 40 → leaks past filter)\n      severity          = ${v.severity}\n      dominant          = ${v.dominant}\n      action preview    = "${v.actionPreview}"`,
      )
      .join("\n")}`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Aggregate diagnostics summary — runs last and prints a per-category report.
// Always passes (informational); turns the suite output into a scoreboard so
// reviewers can spot at-a-glance which assertion category is regressing.
// ─────────────────────────────────────────────────────────────────────────────

Deno.test("fixtures table: SUMMARY — included/failed counts by assert category", () => {
  const totals = {
    total: SCENARIOS.length,
    expectedIncluded: 0,
    expectedExcluded: 0,
    actuallyIncluded: 0,
    actuallyExcluded: 0,
  };
  const failures = {
    includedFlag: [] as string[],
    scoreBand: [] as string[],
    reasons: [] as string[],
    action: [] as string[],
    leakyExcluded: [] as string[],
  };

  for (const s of SCENARIOS) {
    if (s.expect.included) totals.expectedIncluded += 1;
    else totals.expectedExcluded += 1;

    const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 40);
    const gotIncluded = r !== null;
    if (gotIncluded) totals.actuallyIncluded += 1;
    else totals.actuallyExcluded += 1;

    if (gotIncluded !== s.expect.included) {
      failures.includedFlag.push(`${s.name} (expected=${s.expect.included}, got=${gotIncluded})`);
    }

    if (s.expect.included && r) {
      const min = s.expect.minScore;
      const max = s.expect.maxScore;
      if ((typeof min === "number" && r.risk_score < min) ||
          (typeof max === "number" && r.risk_score > max) ||
          r.risk_score < 0 || r.risk_score > 100) {
        failures.scoreBand.push(`${s.name} (score=${r.risk_score}, band=[${min ?? "—"},${max ?? "—"}])`);
      }
      const reasonNeedles = s.expect.reasonsInclude ?? [];
      const reasonMissing = reasonNeedles.filter(
        (n) => !r.reasons.some((reason) => includesNormalized(reason, n)),
      );
      if (reasonMissing.length > 0) {
        failures.reasons.push(`${s.name} (missing: ${JSON.stringify(reasonMissing)})`);
      }
      if (s.expect.actionIncludes !== undefined) {
        const ev = evaluateActionIncludes(r.suggested_action, s.expect.actionIncludes);
        if (!ev.ok) {
          failures.action.push(`${s.name} (${ev.reason}; missing=${JSON.stringify(ev.missing)})`);
        }
      }
    }

    if (!s.expect.included) {
      const r0 = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 0);
      const score = r0?.risk_score ?? 0;
      if (score >= 40) {
        failures.leakyExcluded.push(`${s.name} (score=${score} at threshold=0)`);
      }
    }
  }

  const categoryCounts = {
    includedFlag: failures.includedFlag.length,
    scoreBand: failures.scoreBand.length,
    reasons: failures.reasons.length,
    action: failures.action.length,
    leakyExcluded: failures.leakyExcluded.length,
  };
  const totalFailures = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  // deno-lint-ignore no-console
  console.log(
    [
      "",
      "╔════════════════════════════════════════════════════════════╗",
      "║          FIXTURES TABLE — DIAGNOSTICS SUMMARY              ║",
      "╠════════════════════════════════════════════════════════════╣",
      `║  Scenarios total           : ${String(totals.total).padEnd(28)} ║`,
      `║  Expected included         : ${String(totals.expectedIncluded).padEnd(28)} ║`,
      `║  Expected excluded         : ${String(totals.expectedExcluded).padEnd(28)} ║`,
      `║  Actually included @t=40   : ${String(totals.actuallyIncluded).padEnd(28)} ║`,
      `║  Actually excluded @t=40   : ${String(totals.actuallyExcluded).padEnd(28)} ║`,
      "╠════════════════════════════════════════════════════════════╣",
      `║  Total failures            : ${String(totalFailures).padEnd(28)} ║`,
      `║   • included-flag          : ${String(categoryCounts.includedFlag).padEnd(28)} ║`,
      `║   • score band             : ${String(categoryCounts.scoreBand).padEnd(28)} ║`,
      `║   • reasons substrings     : ${String(categoryCounts.reasons).padEnd(28)} ║`,
      `║   • action substrings      : ${String(categoryCounts.action).padEnd(28)} ║`,
      `║   • leaky excluded         : ${String(categoryCounts.leakyExcluded).padEnd(28)} ║`,
      "╚════════════════════════════════════════════════════════════╝",
      ...(totalFailures > 0
        ? [
            "Failure details:",
            ...(failures.includedFlag.length
              ? ["  [included-flag]", ...failures.includedFlag.map((x) => `    - ${x}`)]
              : []),
            ...(failures.scoreBand.length
              ? ["  [score band]", ...failures.scoreBand.map((x) => `    - ${x}`)]
              : []),
            ...(failures.reasons.length
              ? ["  [reasons]", ...failures.reasons.map((x) => `    - ${x}`)]
              : []),
            ...(failures.action.length
              ? ["  [action]", ...failures.action.map((x) => `    - ${x}`)]
              : []),
            ...(failures.leakyExcluded.length
              ? ["  [leaky excluded]", ...failures.leakyExcluded.map((x) => `    - ${x}`)]
              : []),
          ]
        : ["  ✓ All assertion categories clean."]),
      "",
    ].join("\n"),
  );

  // Sanity invariants — must always hold.
  assertEquals(
    totals.expectedIncluded + totals.expectedExcluded,
    totals.total,
    "summary: expected included+excluded must equal total",
  );
  assertEquals(
    totals.actuallyIncluded + totals.actuallyExcluded,
    totals.total,
    "summary: actually included+excluded must equal total",
  );
});
