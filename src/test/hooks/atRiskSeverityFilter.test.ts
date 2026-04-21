import { describe, it, expect } from "vitest";
import {
  AT_RISK_SEVERITY_PRESETS,
} from "@/hooks/win-loss/atRiskPresets";
import {
  sanitizeSeverities,
  sanitize,
  AT_RISK_DEFAULTS,
} from "@/hooks/win-loss/useAtRiskSettings";
import { severityFromScore } from "@/lib/winloss/severityFromScore";

describe("AtRisk severity presets", () => {
  it("expõe 4 presets exatos: low/medium/high/critical na ordem", () => {
    expect(AT_RISK_SEVERITY_PRESETS).toHaveLength(4);
    expect(AT_RISK_SEVERITY_PRESETS.map((p) => p.id)).toEqual([
      "low",
      "medium",
      "high",
      "critical",
    ]);
    for (const p of AT_RISK_SEVERITY_PRESETS) {
      expect(p.label.startsWith("Só ")).toBe(true);
      expect(p.activeClass.length).toBeGreaterThan(0);
    }
  });

  it("severityFromScore alinha com bordas de presets cumulativos (40/50/65/80)", () => {
    expect(severityFromScore(20)).toBe("low");
    expect(severityFromScore(49)).toBe("low");
    expect(severityFromScore(50)).toBe("medium");
    expect(severityFromScore(64)).toBe("medium");
    expect(severityFromScore(65)).toBe("high");
    expect(severityFromScore(79)).toBe("high");
    expect(severityFromScore(80)).toBe("critical");
    expect(severityFromScore(100)).toBe("critical");
  });

  it("sanitizeSeverities rejeita valores inválidos e dedupe", () => {
    expect(sanitizeSeverities(["critical", "low", "invalid", "critical"])).toEqual([
      "critical",
      "low",
    ]);
    expect(sanitizeSeverities("nope")).toEqual([]);
    expect(sanitizeSeverities(null)).toEqual([]);
    expect(sanitizeSeverities(["LOW"])).toEqual([]); // case-sensitive
  });

  it("AT_RISK_DEFAULTS expõe severityFilter vazio", () => {
    expect(AT_RISK_DEFAULTS.severityFilter).toEqual([]);
  });

  it("sanitize preserva severityFilter válido vindo de partial", () => {
    const out = sanitize({ severityFilter: ["high", "critical", "bogus" as never] });
    expect(out.severityFilter).toEqual(["high", "critical"]);
  });
});
