/**
 * Hard guarantees that `matched_pattern` and `suggested_action` are never
 * empty, whitespace-only, or shorter than the minimum copy length, across
 * extreme/degenerate inputs.
 */
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeDealRisk,
  suggestedActionFor,
  type LossPattern,
  type OpenDeal,
  type RiskSeverity,
} from "./scoring.ts";

const NOW = new Date("2025-01-15T00:00:00Z");
const MIN_ACTION = 15;

function isMeaningful(s: string | null | undefined, min = 1): boolean {
  return typeof s === "string" && s.trim().length >= min;
}

function deal(overrides: Partial<OpenDeal> = {}): OpenDeal {
  return {
    id: "x",
    client_name: "ACME",
    amount: 25000,
    status: "negotiation",
    category: null,
    source: null,
    updated_at: new Date(NOW.getTime() - 50 * 86_400_000).toISOString(),
    created_at: null,
    ...overrides,
  };
}

const REALISTIC: LossPattern[] = [
  { pattern_type: "loss_factor", label: "Loss típico", outcome: "lost", frequency: 20, win_rate: 0.1, avg_cycle_days: 30, avg_amount: 25000, confidence: 0.8 },
  { pattern_type: "stuck_stage", label: "Negotiation travado", outcome: "lost", frequency: 12, win_rate: 0.15, avg_cycle_days: 28, avg_amount: 22000, confidence: 0.75 },
  { pattern_type: "competitor", label: "Concorrência presente", outcome: "lost", frequency: 8, win_rate: 0.2, avg_cycle_days: 25, avg_amount: 24000, confidence: 0.7 },
];

const ALL_BLANK: LossPattern[] = [
  { pattern_type: "loss_factor", label: "   ", outcome: "lost", frequency: 5, win_rate: 0.1, avg_cycle_days: 20, avg_amount: 10000, confidence: 0.6 },
  { pattern_type: "stuck_stage", label: "", outcome: "lost", frequency: 5, win_rate: 0.1, avg_cycle_days: 20, avg_amount: 10000, confidence: 0.6 },
  { pattern_type: "competitor", label: null as unknown as string, outcome: "lost", frequency: 5, win_rate: 0.1, avg_cycle_days: 20, avg_amount: 10000, confidence: 0.6 },
];

const NULL_FIELDS: LossPattern[] = [
  { pattern_type: null, label: null, outcome: null, frequency: null, win_rate: null, avg_cycle_days: null, avg_amount: null, confidence: null },
];

const UNKNOWN_TYPE: LossPattern[] = [
  { pattern_type: "totally_unknown_kind", label: "  ", outcome: "lost", frequency: 4, win_rate: 0.1, avg_cycle_days: 30, avg_amount: 25000, confidence: 0.55 },
];

const WIN_FACTOR: LossPattern[] = [
  { pattern_type: "win_factor", label: "Padrão vencedor", outcome: "won", frequency: 10, win_rate: 0.9, avg_cycle_days: 20, avg_amount: 25000, confidence: 0.9 },
];

const STATUSES: Array<string | null> = [
  null, "", "   ", "unknown_xyz", "lead", "negotiation", "proposal", "qualified", "pending",
];
const SOURCES: Array<string | null> = [null, "", "   ", "leilao_publico", "concorrencia"];
const AMOUNTS = [-1, 0, 1, 25000, 1e9];
const AGES_DAYS = [0, 1, 50, 365, 9999];
const PATTERN_SETS: Array<{ name: string; patterns: LossPattern[] }> = [
  { name: "realistic", patterns: REALISTIC },
  { name: "all_blank", patterns: ALL_BLANK },
  { name: "null_fields", patterns: NULL_FIELDS },
  { name: "unknown_type", patterns: UNKNOWN_TYPE },
  { name: "win_factor", patterns: WIN_FACTOR },
  { name: "empty", patterns: [] },
];

Deno.test("matched_pattern + suggested_action: non-empty across extreme combinatorial sweep", () => {
  let evaluated = 0;
  for (const status of STATUSES) {
    for (const source of SOURCES) {
      for (const amount of AMOUNTS) {
        for (const ageDays of AGES_DAYS) {
          for (const ps of PATTERN_SETS) {
            const d = deal({
              id: `${status}-${source}-${amount}-${ageDays}-${ps.name}`,
              status,
              source,
              amount,
              updated_at: new Date(NOW.getTime() - ageDays * 86_400_000).toISOString(),
            });
            const r = computeDealRisk(d, ps.patterns, NOW, 0);
            if (!r) continue;
            evaluated++;
            const tag = `[${ps.name} status=${status} source=${source} amt=${amount} age=${ageDays}]`;

            assert(
              isMeaningful(r.matched_pattern),
              `${tag} matched_pattern empty/whitespace: "${r.matched_pattern}"`,
            );
            assert(
              isMeaningful(r.suggested_action, MIN_ACTION),
              `${tag} suggested_action too short: "${r.suggested_action}"`,
            );
            assert(
              isMeaningful(r.breakdown.matched_pattern_label),
              `${tag} breakdown.matched_pattern_label empty`,
            );
          }
        }
      }
    }
  }
  assert(evaluated > 0, "expected at least one scenario above threshold=0");
});

Deno.test("matched_pattern: never empty when ALL pattern labels are blank", () => {
  const r = computeDealRisk(deal({}), ALL_BLANK, NOW, 0);
  assert(r);
  assert(isMeaningful(r.matched_pattern));
  assert(/Sinal de risco/i.test(r.matched_pattern));
});

Deno.test("matched_pattern: never empty when patterns array is empty", () => {
  const r = computeDealRisk(
    deal({ updated_at: new Date(NOW.getTime() - 365 * 86_400_000).toISOString() }),
    [],
    NOW,
    0,
  );
  if (r) {
    assert(isMeaningful(r.matched_pattern));
    assert(isMeaningful(r.suggested_action, MIN_ACTION));
  }
});

Deno.test("matched_pattern: never empty with all-null pattern fields", () => {
  const r = computeDealRisk(deal({}), NULL_FIELDS, NOW, 0);
  if (r) {
    assert(isMeaningful(r.matched_pattern));
    assert(isMeaningful(r.suggested_action, MIN_ACTION));
  }
});

Deno.test("suggested_action: ≥15 chars across full severity matrix and all pattern types", () => {
  const types = ["loss_factor", "stuck_stage", "competitor", "win_factor", "unknown_kind", ""];
  const severities: RiskSeverity[] = ["low", "medium", "high", "critical"];
  const outcomes: Array<string | null> = ["lost", "won", null, ""];
  const stages: Array<string | null> = [null, "", "negotiation", "weird_stage"];

  for (const t of types) {
    for (const sev of severities) {
      for (const oc of outcomes) {
        for (const st of stages) {
          const a = suggestedActionFor(t, st, { outcome: oc, severity: sev });
          assert(
            isMeaningful(a, MIN_ACTION),
            `type=${t} sev=${sev} outcome=${oc} stage=${st} → too short: "${a}"`,
          );
        }
      }
    }
  }
});

Deno.test("matched_pattern + suggested_action: degenerate deal (all nullish) still yields meaningful copy", () => {
  const degenerate: OpenDeal = {
    id: "deg",
    client_name: null,
    amount: null,
    status: null,
    category: null,
    source: null,
    updated_at: null,
    created_at: null,
  };
  for (const ps of PATTERN_SETS) {
    const r = computeDealRisk(degenerate, ps.patterns, NOW, 0);
    if (!r) continue;
    assert(isMeaningful(r.matched_pattern), `[${ps.name}] matched_pattern empty for degenerate deal`);
    assert(isMeaningful(r.suggested_action, MIN_ACTION), `[${ps.name}] action too short for degenerate deal`);
  }
});

Deno.test("matched_pattern equals breakdown.matched_pattern_label (no divergence)", () => {
  const r = computeDealRisk(deal({}), REALISTIC, NOW, 0);
  assert(r);
  assert(r.matched_pattern === r.breakdown.matched_pattern_label);
});
