/**
 * Guarantees: when no perfect pattern match exists, suggested_action falls
 * back deterministically based on (patternType, severity), without leaking
 * generic copy into specific families or vice-versa.
 */
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  computeDealRisk,
  suggestedActionFor,
  type LossPattern,
  type OpenDeal,
  type RiskSeverity,
} from "./scoring.ts";

const NOW = new Date("2025-01-15T00:00:00Z");
const SEVERITIES: RiskSeverity[] = ["low", "medium", "high", "critical"];

// Hard-coded whitelist of the 4 strings the `default` branch can emit.
const DEFAULT_BRANCH_STRINGS = new Set([
  "Revisar deal urgente com gestor — múltiplos sinais de risco cruzados",
  "Revisar abordagem com o cliente nas próximas 48h",
  "Revisar abordagem com o cliente nas próximas 72h",
  "Confirmar próximo passo do deal com o cliente",
]);

const WIN_STRING = "Reaplicar abordagem consultiva vencedora deste perfil de cliente";

// Per-family fragments that MUST appear, and fragments that must NOT appear
// (taken from sibling families) to prove no cross-leak.
const FAMILY_RULES: Record<
  "loss_factor" | "stuck_stage" | "competitor",
  { mustMatch: RegExp; mustNotMatch: RegExp[] }
> = {
  loss_factor: {
    mustMatch: /(proposta|valor percebido|resgate|interesse do cliente|ROI)/i,
    // loss copy never mentions stage names or competitor lingo
    mustNotMatch: [/estágio "/i, /battle card/i, /diferenciação competitiva/i, /concorrência ativa/i],
  },
  stuck_stage: {
    mustMatch: /(estágio|desbloquear|destravar|critério de avanço)/i,
    mustNotMatch: [/proposta/i, /battle card/i, /diferenciação competitiva/i],
  },
  competitor: {
    mustMatch: /(concorr|battle card|diferenciação competitiva|posicionamento competitivo|contra-argumentos)/i,
    mustNotMatch: [/estágio "/i, /proposta/i, /ROI/i],
  },
};

Deno.test("fallback: each canonical patternType routes to its own family (no cross-leak)", () => {
  for (const [type, rules] of Object.entries(FAMILY_RULES)) {
    for (const sev of SEVERITIES) {
      // outcome must NOT be "won" (which would override to win-string)
      for (const outcome of ["lost", null, "", "pending"]) {
        const a = suggestedActionFor(type, "negotiation", { outcome, severity: sev });
        assert(
          rules.mustMatch.test(a),
          `[${type}/${sev}/outcome=${outcome}] missing required fragment in: "${a}"`,
        );
        for (const bad of rules.mustNotMatch) {
          assert(
            !bad.test(a),
            `[${type}/${sev}/outcome=${outcome}] leaked sibling-family fragment ${bad}: "${a}"`,
          );
        }
        // And: never collides with the default-branch whitelist or the win string.
        assert(!DEFAULT_BRANCH_STRINGS.has(a), `[${type}/${sev}] family copy collided with default copy: "${a}"`);
        assert(a !== WIN_STRING, `[${type}/${sev}] family copy collided with win copy`);
      }
    }
  }
});

Deno.test("fallback: garbage/unknown patternType ALWAYS falls into default branch whitelist", () => {
  const garbageTypes = ["", "   ", "generic", "loss", "lost", "won_xyz", "totally_unknown_kind", "123", "null"];
  for (const t of garbageTypes) {
    for (const sev of SEVERITIES) {
      // Skip outcome="won" (would short-circuit to win string)
      for (const outcome of ["lost", null, "", "pending"]) {
        const a = suggestedActionFor(t, "negotiation", { outcome, severity: sev });
        assert(
          DEFAULT_BRANCH_STRINGS.has(a),
          `[type="${t}" sev=${sev} outcome=${outcome}] not in default whitelist: "${a}"`,
        );
      }
    }
  }
});

Deno.test("fallback: outcome='won' is an absolute override regardless of patternType/severity/case", () => {
  const types = ["loss_factor", "stuck_stage", "competitor", "unknown_kind", "", "generic"];
  const wonOutcomes = ["won", "WON", "Won", "wOn"];
  for (const t of types) {
    for (const sev of SEVERITIES) {
      for (const oc of wonOutcomes) {
        const a = suggestedActionFor(t, "negotiation", { outcome: oc, severity: sev });
        assertEquals(a, WIN_STRING, `[type=${t} sev=${sev} outcome=${oc}] should override to win string`);
      }
    }
  }
  // Also: patternType="win_factor" with any outcome → win string.
  for (const sev of SEVERITIES) {
    for (const oc of ["lost", null, "won", ""]) {
      const a = suggestedActionFor("win_factor", "negotiation", { outcome: oc, severity: sev });
      assertEquals(a, WIN_STRING);
    }
  }
});

Deno.test("fallback: deterministic — identical inputs always yield identical outputs (50× snapshot)", () => {
  const inputs: Array<[string, string | null, RiskSeverity, string | null]> = [
    ["loss_factor", "negotiation", "critical", "lost"],
    ["stuck_stage", "proposal", "high", null],
    ["competitor", "qualified", "medium", "lost"],
    ["unknown_xyz", null, "low", ""],
    ["", "weird_stage", "critical", "lost"],
  ];
  for (const [type, status, sev, outcome] of inputs) {
    const first = suggestedActionFor(type, status, { outcome, severity: sev });
    for (let i = 0; i < 50; i++) {
      const again = suggestedActionFor(type, status, { outcome, severity: sev });
      assertEquals(again, first, `non-deterministic at iter ${i} for type=${type}/sev=${sev}`);
    }
  }
});

Deno.test("fallback: urgency markers only allowed in critical/high of risk families (never in won)", () => {
  const URGENCY = /imediata|urgente|24h|hoje/i;
  const riskTypes = ["loss_factor", "stuck_stage", "competitor", "generic", "unknown_xyz"];
  for (const t of riskTypes) {
    for (const sev of SEVERITIES) {
      const a = suggestedActionFor(t, "negotiation", { outcome: "lost", severity: sev });
      const hasUrgency = URGENCY.test(a);
      if (sev === "low" || sev === "medium") {
        assert(!hasUrgency, `[${t}/${sev}] medium/low must not be urgent: "${a}"`);
      }
    }
    // outcome=won → never urgent, regardless of severity
    for (const sev of SEVERITIES) {
      const a = suggestedActionFor(t, "negotiation", { outcome: "won", severity: sev });
      assert(!URGENCY.test(a), `[${t}/${sev}/won] must not be urgent: "${a}"`);
    }
  }
});

// ---------- end-to-end via computeDealRisk ----------

const ALLOWED_DOMINANT_TYPES = new Set(["loss_factor", "stuck_stage", "competitor", "generic", "win_factor"]);

const REALISTIC_LOSS: LossPattern[] = [
  { pattern_type: "loss_factor", label: "Loss típico", outcome: "lost", frequency: 20, win_rate: 0.1, avg_cycle_days: 30, avg_amount: 25000, confidence: 0.8 },
  { pattern_type: "stuck_stage", label: "Negotiation travado", outcome: "lost", frequency: 12, win_rate: 0.15, avg_cycle_days: 28, avg_amount: 22000, confidence: 0.75 },
];

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

Deno.test("end-to-end: dominant.type stays in closed set; suggested_action matches dominant family", () => {
  // Case A: realistic loss → dominant ∈ {loss_factor, stuck_stage}
  const r1 = computeDealRisk(deal({}), REALISTIC_LOSS, NOW, 0);
  assert(r1);
  assert(ALLOWED_DOMINANT_TYPES.has(r1.breakdown.matched_pattern_type), `unexpected type: ${r1.breakdown.matched_pattern_type}`);
  const family = r1.breakdown.matched_pattern_type as keyof typeof FAMILY_RULES;
  if (family === "loss_factor" || family === "stuck_stage") {
    assert(
      FAMILY_RULES[family].mustMatch.test(r1.suggested_action),
      `dominant=${family} but copy doesn't match family: "${r1.suggested_action}"`,
    );
  }

  // Case B: empty patterns + ancient deal → dominant === "generic" → default whitelist
  const r2 = computeDealRisk(
    deal({ updated_at: new Date(NOW.getTime() - 365 * 86_400_000).toISOString() }),
    [],
    NOW,
    0,
  );
  if (r2) {
    assertEquals(r2.breakdown.matched_pattern_type, "generic");
    assert(
      DEFAULT_BRANCH_STRINGS.has(r2.suggested_action),
      `generic dominant did not produce default-branch copy: "${r2.suggested_action}"`,
    );
  }
});
