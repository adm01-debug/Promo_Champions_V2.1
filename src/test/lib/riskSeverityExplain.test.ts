import { describe, it, expect } from "vitest";
import { explainSeverity } from "@/lib/winloss/riskSeverity";

describe("explainSeverity", () => {
  it("critical: final ≥ 80 ∧ conf ≥ 0.7", () => {
    const e = explainSeverity(85, 0.82);
    expect(e.applied).toBe("critical");
    expect(e.demoted).toBe(false);
    expect(e.reason).toMatch(/≥ 80.*≥ 0\.70.*critical/);
    expect(e.distanceToNext).toBeNull();
    expect(e.distanceToPrev).toEqual({ delta: 6, target: "high" }); // 85 - 79
  });

  it("high (demoted): score qualifies but confidence too low", () => {
    const e = explainSeverity(85, 0.6);
    expect(e.applied).toBe("high");
    expect(e.demoted).toBe(true);
    expect(e.reason).toMatch(/demovido para high/);
    expect(e.distanceToNext).toEqual({ kind: "confidence", delta: 0.1, target: "critical" });
  });

  it("high (pure): 65 ≤ final < 80", () => {
    const e = explainSeverity(72, 0.9);
    expect(e.applied).toBe("high");
    expect(e.demoted).toBe(false);
    expect(e.reason).toMatch(/∈ \[65, 80\).*high/);
    expect(e.distanceToNext).toEqual({ kind: "score", delta: 8, target: "critical" });
    expect(e.distanceToPrev).toEqual({ delta: 8, target: "medium" }); // 72 - 64
  });

  it("medium: 50 ≤ final < 65", () => {
    const e = explainSeverity(55, 0.9);
    expect(e.applied).toBe("medium");
    expect(e.distanceToNext).toEqual({ kind: "score", delta: 10, target: "high" });
    expect(e.distanceToPrev).toEqual({ delta: 6, target: "low" }); // 55 - 49
  });

  it("low: final < 50", () => {
    const e = explainSeverity(42, 0.9);
    expect(e.applied).toBe("low");
    expect(e.reason).toMatch(/< 50.*low/);
    expect(e.distanceToNext).toEqual({ kind: "score", delta: 8, target: "medium" });
    expect(e.distanceToPrev).toBeNull();
  });

  it("boundaries: 49→low, 50→medium, 64→medium, 65→high, 79→high, 80+0.7→critical", () => {
    expect(explainSeverity(49, 0.9).applied).toBe("low");
    expect(explainSeverity(50, 0.9).applied).toBe("medium");
    expect(explainSeverity(64, 0.9).applied).toBe("medium");
    expect(explainSeverity(65, 0.9).applied).toBe("high");
    expect(explainSeverity(79, 0.9).applied).toBe("high");
    expect(explainSeverity(80, 0.7).applied).toBe("critical");
    expect(explainSeverity(80, 0.69).applied).toBe("high");
    expect(explainSeverity(80, 0.69).demoted).toBe(true);
  });

  it("clamps confidence into [0,1]", () => {
    expect(explainSeverity(85, -1).applied).toBe("high"); // clamped to 0 → demoted
    expect(explainSeverity(85, 5).applied).toBe("critical"); // clamped to 1
  });
});
