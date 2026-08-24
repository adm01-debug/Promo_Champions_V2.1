/**
 * Exhaustive matrix test for `suggestedActionFor`.
 *
 * Iterates every combination of:
 *   - patternType: loss_factor | stuck_stage | competitor | win_factor | generic
 *   - severity:    critical | high | medium | low
 *   - outcome:     "lost" | "won" | null
 *
 * For each of the 60 cells, asserts:
 *   1. Action contains the keywords expected for that branch.
 *   2. Action does NOT leak urgency markers when severity is medium/low
 *      (and never on win-overrides).
 *   3. Action is ≥ 15 chars and deterministic (5x identical re-runs).
 *
 * Mirrors `suggestedActionFor` in scoring.ts (lines 242-293).
 */
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { suggestedActionFor, type RiskSeverity } from "./scoring.ts";

const TYPES = [
  "loss_factor",
  "stuck_stage",
  "competitor",
  "win_factor",
  "generic",
] as const;
const SEVERITIES: RiskSeverity[] = ["critical", "high", "medium", "low"];
const OUTCOMES: Array<"lost" | "won" | null> = ["lost", "won", null];

const STAGE = "negotiation";
const URGENCY_RE = /urgente|imediata|24h|\bhoje\b/i;

const STAGE_RE = new RegExp(STAGE);

const KEYWORDS: Record<
  Exclude<(typeof TYPES)[number], "win_factor">,
  Record<RiskSeverity, RegExp[]>
> = {
  loss_factor: {
    critical: [/IMEDIATA/, /24h/, /resgate/i],
    high: [/48h/, /valor/i],
    medium: [/valor/i, /semana/i],
    low: [/confirmar/i, /interesse/i],
  },
  stuck_stage: {
    critical: [/URGENTE/, /hoje/i, /desbloquear/i, STAGE_RE],
    high: [/48h/, STAGE_RE],
    medium: [/semana/i, STAGE_RE],
    low: [STAGE_RE, /critério/i],
  },
  competitor: {
    critical: [/24h/, /battle card/i, /decisor/i],
    high: [/48h/, /diferenciação/i],
    medium: [/competitivo/i, /contra-argumentos/i],
    low: [/concorrente/i, /objeções/i],
  },
  generic: {
    critical: [/urgente/i, /gestor/i],
    high: [/48h/],
    medium: [/72h/],
    low: [/próximo passo/i],
  },
};

const WIN_KEYWORDS = [/vencedora|reaplicar/i, /consultiva/i];

Deno.test("matrix: 60 cells of patternType × severity × outcome", async (t) => {
  for (const type of TYPES) {
    for (const sev of SEVERITIES) {
      for (const outcome of OUTCOMES) {
        await t.step(`${type} × ${sev} × ${outcome ?? "null"}`, () => {
          const action = suggestedActionFor(type, STAGE, { severity: sev, outcome });

          assert(
            action.trim().length >= 15,
            `too short for ${type}/${sev}/${outcome}: "${action}"`,
          );

          // Determinism: same inputs → same output (5 runs).
          for (let i = 0; i < 5; i++) {
            const again = suggestedActionFor(type, STAGE, { severity: sev, outcome });
            assert(
              again === action,
              `non-deterministic for ${type}/${sev}/${outcome} on run ${i}`,
            );
          }

          const isWinOverride = type === "win_factor" || outcome === "won";

          if (isWinOverride) {
            for (const re of WIN_KEYWORDS) {
              assert(re.test(action), `win missing ${re}: "${action}"`);
            }
            assert(
              !URGENCY_RE.test(action),
              `win override leaked urgency (${type}/${sev}/${outcome}): "${action}"`,
            );
            return;
          }

          // Non-win branches: validate keywords for the cell.
          const branch = type as Exclude<(typeof TYPES)[number], "win_factor">;
          const expected = KEYWORDS[branch][sev];
          for (const re of expected) {
            assert(
              re.test(action),
              `${branch}/${sev}: missing ${re} in "${action}"`,
            );
          }

          // Calibration: medium/low must NEVER carry urgency markers.
          if (sev === "medium" || sev === "low") {
            assert(
              !URGENCY_RE.test(action),
              `${branch}/${sev} leaked urgency: "${action}"`,
            );
          }
        });
      }
    }
  }
});

Deno.test("stuck_stage: stage value is interpolated literally across all severities", () => {
  const stages: Array<string | null> = ["qualified", "proposal", "negotiation", null];
  for (const stage of stages) {
    for (const sev of SEVERITIES) {
      const action = suggestedActionFor("stuck_stage", stage, {
        severity: sev,
        outcome: "lost",
      });
      const expected = stage ?? "atual";
      assert(
        action.includes(expected),
        `stuck_stage/${sev}: expected stage "${expected}" in "${action}"`,
      );
    }
  }
});
