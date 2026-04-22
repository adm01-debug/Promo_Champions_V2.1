/**
 * TEMPORARY ground-truth dump.
 *
 * Runs every scenario fixture through `computeDealRisk` with the realistic
 * pattern set (threshold=0 so excluded ones are also visible) and prints a
 * table with the *observed* score, severity, dominant pattern type, and
 * matched_pattern label. Use the output as authoritative ground truth when
 * tightening minScore/maxScore bands or patternTypeOneOf assertions.
 *
 * Usage:
 *   deno run --allow-read --allow-env supabase/functions/detect-winloss-at-risk/_dump_scenarios.ts
 *
 * Optional flags via env:
 *   FORMAT=json  → emit one JSON object per line (machine-readable)
 *   ONLY=name1,name2 → restrict to specific scenarios by name
 *
 * Delete this file once the ground truth is captured into the fixtures.
 */
import { computeDealRisk, severityFromScore } from "./scoring.ts";
import { LOSS_PATTERNS_REALISTIC, NOW, SCENARIOS } from "./fixtures.ts";

const FORMAT = (Deno.env.get("FORMAT") ?? "table").toLowerCase();
const ONLY = (Deno.env.get("ONLY") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

interface Row {
  name: string;
  expectedIncluded: boolean;
  observedIncluded: boolean;
  risk_score: number | null;
  severity: string | null;
  matched_pattern_type: string | null;
  matched_pattern: string | null;
  matched_confidence: number | null;
  expectedBand: string;
  expectedPatternTypeOneOf: string;
}

const rows: Row[] = [];
for (const s of SCENARIOS) {
  if (ONLY.length > 0 && !ONLY.includes(s.name)) continue;
  // threshold=0 so we observe excluded scenarios too (they'd be null at 40).
  const r = computeDealRisk(s.deal, LOSS_PATTERNS_REALISTIC, NOW, 0);
  rows.push({
    name: s.name,
    expectedIncluded: s.expect.included,
    observedIncluded: (r?.risk_score ?? 0) >= 40,
    risk_score: r?.risk_score ?? null,
    severity: r
      ? (r.breakdown.severity ?? severityFromScore(r.risk_score, r.breakdown.matched_confidence))
      : null,
    matched_pattern_type: r?.breakdown.matched_pattern_type ?? null,
    matched_pattern: r?.matched_pattern ?? null,
    matched_confidence: r?.breakdown.matched_confidence ?? null,
    expectedBand: `[${s.expect.minScore ?? "—"}, ${s.expect.maxScore ?? "—"}]`,
    expectedPatternTypeOneOf: s.expect.patternTypeOneOf?.join("|") ?? "—",
  });
}

if (FORMAT === "json") {
  for (const row of rows) console.log(JSON.stringify(row));
  Deno.exit(0);
}

// Table format
const cols: Array<{ key: keyof Row; label: string; width: number }> = [
  { key: "name", label: "scenario", width: 38 },
  { key: "risk_score", label: "score", width: 6 },
  { key: "severity", label: "severity", width: 10 },
  { key: "matched_pattern_type", label: "type", width: 14 },
  { key: "matched_confidence", label: "conf", width: 5 },
  { key: "expectedBand", label: "exp.band", width: 12 },
  { key: "expectedPatternTypeOneOf", label: "exp.types", width: 22 },
  { key: "matched_pattern", label: "matched_pattern", width: 40 },
];

function pad(v: unknown, w: number): string {
  const s = v === null || v === undefined ? "—" : String(v);
  return s.length > w ? s.slice(0, w - 1) + "…" : s.padEnd(w);
}

const header = cols.map((c) => pad(c.label, c.width)).join(" │ ");
const sep = cols.map((c) => "─".repeat(c.width)).join("─┼─");

console.log("");
console.log("Ground-truth dump — computeDealRisk(scenario.deal, LOSS_PATTERNS_REALISTIC, NOW, threshold=0)");
console.log(`Total scenarios: ${rows.length}    NOW: ${NOW.toISOString()}`);
console.log("");
console.log(header);
console.log(sep);

for (const row of rows) {
  const flag = row.expectedIncluded === row.observedIncluded ? " " : "!";
  const line = cols.map((c) => pad(row[c.key], c.width)).join(" │ ");
  console.log(`${flag} ${line}`);
}

console.log("");
console.log("Legend: leading '!' = expected.included does NOT match observed (score>=40).");
console.log("Tip:    FORMAT=json deno run … _dump_scenarios.ts  → JSONL for scripting");
console.log("        ONLY=name1,name2 deno run … _dump_scenarios.ts  → filter by name");
