import { describe, it, expect } from "vitest";
import { deriveSeverity, summarizeActionMatrix, SEVERITY_RULES } from "./riskSeverity";

describe("deriveSeverity — matriz de severidade Win/Loss", () => {
  it("classifica como critical apenas quando final≥80 E conf≥0.7", () => {
    expect(deriveSeverity(80, 0.7)).toBe("critical");
    expect(deriveSeverity(95, 1)).toBe("critical");
    expect(deriveSeverity(80, 0.69)).toBe("high"); // conf abaixo do limite
    expect(deriveSeverity(79.9, 1)).toBe("high"); // final abaixo do limite
  });

  it("classifica como high para final entre 65 e 79 (independente de conf)", () => {
    expect(deriveSeverity(65, 0)).toBe("high");
    expect(deriveSeverity(79, 1)).toBe("high");
  });

  it("classifica como medium para final entre 50 e 64", () => {
    expect(deriveSeverity(50, 0.5)).toBe("medium");
    expect(deriveSeverity(64.99, 0.9)).toBe("medium");
  });

  it("classifica como low para final < 50", () => {
    expect(deriveSeverity(0, 0)).toBe("low");
    expect(deriveSeverity(49.9, 1)).toBe("low");
  });

  it("trata confidence null/undefined como 0.5 (fallback seguro)", () => {
    expect(deriveSeverity(80, null)).toBe("high"); // 0.5 < 0.7
    expect(deriveSeverity(80, undefined)).toBe("high");
    expect(deriveSeverity(65, null)).toBe("high");
  });

  it("clampa confidence fora do intervalo [0,1]", () => {
    expect(deriveSeverity(80, -5)).toBe("high"); // clamp para 0
    expect(deriveSeverity(80, 99)).toBe("critical"); // clamp para 1
  });

  it("SEVERITY_RULES está em ordem descendente (first-match-wins)", () => {
    const order = SEVERITY_RULES.map((r) => r.severity);
    expect(order).toEqual(["critical", "high", "medium", "low"]);
  });
});

describe("summarizeActionMatrix — dispatch de ação sugerida", () => {
  it("aplica win-override quando outcome=won mesmo sem pattern", () => {
    const r = summarizeActionMatrix(null, "critical", "won");
    expect(r.kind).toBe("win-override");
  });

  it("aplica win-override quando patternType=win_factor", () => {
    const r = summarizeActionMatrix("win_factor", "high", "lost");
    expect(r.kind).toBe("win-override");
  });

  it("aplica matrix canônica para loss_factor/stuck_stage/competitor", () => {
    for (const t of ["loss_factor", "stuck_stage", "competitor"]) {
      const r = summarizeActionMatrix(t, "medium", "lost");
      expect(r.kind).toBe("matrix");
      expect(r.label).toBe(`${t} × medium`);
    }
  });

  it("cai em default-fallback para pattern desconhecido/vazio", () => {
    expect(summarizeActionMatrix(null, "low").kind).toBe("default-fallback");
    expect(summarizeActionMatrix("", "high").kind).toBe("default-fallback");
    expect(summarizeActionMatrix("unknown_type", "critical").kind).toBe(
      "default-fallback",
    );
  });

  it("normaliza outcome case-insensitive", () => {
    expect(summarizeActionMatrix(null, "low", "WON").kind).toBe("win-override");
    expect(summarizeActionMatrix(null, "low", "Won").kind).toBe("win-override");
  });
});
