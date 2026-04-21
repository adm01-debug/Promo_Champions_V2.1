/**
 * Cross-cell properties for `suggestedActionFor` that single-cell tests miss:
 *   1. Urgency must decrease monotonically as severity drops (lost outcome).
 *   2. outcome="won" always neutralises urgency to 0 + positive copy.
 *   3. outcome="lost" ≡ outcome=null (lost is the default).
 *   4. outcome="won" always overrides outcome="lost" for non-win types.
 *   5. patternType="win_factor" ignores outcome entirely (absolute override).
 *
 * Mirrors `suggestedActionFor` in scoring.ts (lines 242-293).
 */
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { suggestedActionFor, type RiskSeverity } from "./scoring.ts";

const SEVERITIES: RiskSeverity[] = ["critical", "high", "medium", "low"];
const STAGE = "negotiation";

const NON_WIN_TYPES = ["loss_factor", "stuck_stage", "competitor", "generic"] as const;
const ALL_TYPES = [...NON_WIN_TYPES, "win_factor"] as const;

const POSITIVE_RE = /vencedora|reaplicar/i;

/**
 * Maps a suggested-action string to a 0-3 urgency band.
 * 3 = explicit emergency (IMEDIATA / URGENTE / 24h / hoje)
 * 2 = 48h window
 * 1 = weekly cadence (semana / 72h)
 * 0 = no temporal urgency marker
 */
function urgencyLevel(action: string): 0 | 1 | 2 | 3 {
  if (/IMEDIATA|URGENTE|24h|\bhoje\b/.test(action)) return 3;
  if (/48h/.test(action)) return 2;
  if (/semana|72h/i.test(action)) return 1;
  return 0;
}

Deno.test("urgencyLevel helper: classifies known fixtures correctly", () => {
  assertEquals(urgencyLevel("AÇÃO IMEDIATA: agendar call em 24h"), 3);
  assertEquals(urgencyLevel("URGENTE: desbloquear estágio hoje"), 3);
  assertEquals(urgencyLevel("Revisar proposta nas próximas 48h"), 2);
  assertEquals(urgencyLevel("Reforçar valor percebido esta semana"), 1);
  assertEquals(urgencyLevel("Revisar abordagem nas próximas 72h"), 1);
  assertEquals(urgencyLevel("Confirmar próximo passo do deal"), 0);
});

Deno.test("Bloco 1: urgency decreases monotonically across severities (lost outcome)", () => {
  for (const type of NON_WIN_TYPES) {
    const lvls = SEVERITIES.map((sev) =>
      urgencyLevel(suggestedActionFor(type, STAGE, { severity: sev, outcome: "lost" })),
    );
    assert(
      lvls[0] > lvls[1],
      `${type}: critical (${lvls[0]}) must be > high (${lvls[1]})`,
    );
    assert(
      lvls[1] > lvls[2],
      `${type}: high (${lvls[1]}) must be > medium (${lvls[2]})`,
    );
    assert(
      lvls[2] >= lvls[3],
      `${type}: medium (${lvls[2]}) must be ≥ low (${lvls[3]})`,
    );
    // Scale must descend; medium and low may collapse to the same level
    // when low-severity copy still mentions "semanas" (no urgency markers).
    assert(
      lvls[0] === 3 && lvls[1] === 2 && lvls[2] === 1 && lvls[3] <= 1,
      `${type}: expected [3,2,1,≤1], got ${JSON.stringify(lvls)}`,
    );
  }
});

Deno.test("Bloco 2: outcome=won zeroes urgency for every (type × severity)", () => {
  for (const type of ALL_TYPES) {
    for (const sev of SEVERITIES) {
      const action = suggestedActionFor(type, STAGE, { severity: sev, outcome: "won" });
      assertEquals(
        urgencyLevel(action),
        0,
        `${type}/${sev}: won leaked urgency in "${action}"`,
      );
      assert(
        POSITIVE_RE.test(action),
        `${type}/${sev}: won missing positive copy in "${action}"`,
      );
    }
  }
});

Deno.test("Bloco 3: outcome=lost ≡ outcome=null (lost is the default)", () => {
  for (const type of NON_WIN_TYPES) {
    for (const sev of SEVERITIES) {
      const lost = suggestedActionFor(type, STAGE, { severity: sev, outcome: "lost" });
      const nullish = suggestedActionFor(type, STAGE, { severity: sev, outcome: null });
      assertEquals(lost, nullish, `${type}/${sev}: lost vs null differ`);
    }
  }
});

Deno.test("Bloco 4: outcome=won always differs from outcome=lost for non-win types", () => {
  for (const type of NON_WIN_TYPES) {
    for (const sev of SEVERITIES) {
      const lost = suggestedActionFor(type, STAGE, { severity: sev, outcome: "lost" });
      const won = suggestedActionFor(type, STAGE, { severity: sev, outcome: "won" });
      assert(
        lost !== won,
        `${type}/${sev}: won did NOT override lost (both = "${lost}")`,
      );
    }
  }
});

Deno.test("Bloco 5: win_factor ignores outcome — always positive, never urgent", () => {
  for (const sev of SEVERITIES) {
    for (const oc of ["lost", "won", null] as const) {
      const action = suggestedActionFor("win_factor", STAGE, { severity: sev, outcome: oc });
      assertEquals(
        urgencyLevel(action),
        0,
        `win_factor/${sev}/${oc}: leaked urgency in "${action}"`,
      );
      assert(
        POSITIVE_RE.test(action),
        `win_factor/${sev}/${oc}: missing positive copy in "${action}"`,
      );
    }
  }
});
