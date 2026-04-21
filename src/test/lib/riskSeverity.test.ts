import { describe, it, expect } from "vitest";
import {
  deriveSeverity,
  summarizeActionMatrix,
  SEVERITY_RULES,
} from "@/lib/winloss/riskSeverity";

describe("deriveSeverity", () => {
  it("returns 'critical' when score ≥ 80 and conf ≥ 0.7", () => {
    expect(deriveSeverity(85, 0.8)).toBe("critical");
    expect(deriveSeverity(80, 0.7)).toBe("critical");
  });

  it("demotes to 'high' when score ≥ 80 but conf < 0.7", () => {
    expect(deriveSeverity(85, 0.6)).toBe("high");
  });

  it("returns 'high' for 65 ≤ score < 80", () => {
    expect(deriveSeverity(70, 0.9)).toBe("high");
    expect(deriveSeverity(65, 0.5)).toBe("high");
  });

  it("returns 'medium' for 50 ≤ score < 65", () => {
    expect(deriveSeverity(55, 0.9)).toBe("medium");
    expect(deriveSeverity(50, 0.5)).toBe("medium");
  });

  it("returns 'low' for score < 50", () => {
    expect(deriveSeverity(42, 0.9)).toBe("low");
    expect(deriveSeverity(0, 1)).toBe("low");
  });

  it("clamps confidence into [0,1]", () => {
    expect(deriveSeverity(85, -1)).toBe("high"); // conf clamped to 0 → not critical
    expect(deriveSeverity(85, 5)).toBe("critical"); // conf clamped to 1
  });

  it("handles null/undefined confidence as 0.5 default", () => {
    expect(deriveSeverity(85, null)).toBe("high");
    expect(deriveSeverity(85, undefined)).toBe("high");
  });

  it("rules are ordered such that first match wins", () => {
    // 85/0.8 matches both critical AND high rules; first must win.
    const matched = SEVERITY_RULES.find((r) => r.matches(85, 0.8));
    expect(matched?.severity).toBe("critical");
  });
});

describe("summarizeActionMatrix", () => {
  it("returns 'win-override' when patternType is win_factor", () => {
    const r = summarizeActionMatrix("win_factor", "critical", "lost");
    expect(r.kind).toBe("win-override");
    expect(r.label).toMatch(/outcome=won/);
  });

  it("returns 'win-override' when outcome is 'won' (case-insensitive)", () => {
    expect(summarizeActionMatrix("loss_factor", "high", "won").kind).toBe("win-override");
    expect(summarizeActionMatrix("loss_factor", "high", "WON").kind).toBe("win-override");
    expect(summarizeActionMatrix("loss_factor", "high", "Won").kind).toBe("win-override");
  });

  it("returns 'matrix' for canonical patternTypes with non-won outcome", () => {
    for (const t of ["loss_factor", "stuck_stage", "competitor"]) {
      const r = summarizeActionMatrix(t, "medium", "lost");
      expect(r.kind).toBe("matrix");
      expect(r.label).toBe(`${t} × medium`);
    }
  });

  it("returns 'default-fallback' for unknown/empty patternTypes", () => {
    for (const t of ["", "   ", "generic", null, undefined, "weird_kind"]) {
      const r = summarizeActionMatrix(t as string | null, "low", "lost");
      expect(r.kind).toBe("default-fallback");
      expect(r.label).toMatch(/branch default/);
    }
  });
});
