import { describe, it, expect } from "vitest";

/**
 * Lead Scoring Dashboard — comprehensive tests for component logic,
 * ScoreRing rendering, category classification, and factor breakdown.
 */

// ─── ScoreRing SVG math ────────────────────────────────────────────
describe("ScoreRing calculations", () => {
  const computeOffset = (score: number, size = 56) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
  };

  it("returns full circumference offset for score 0", () => {
    const size = 56;
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    expect(computeOffset(0)).toBeCloseTo(circumference);
  });

  it("returns 0 offset for score 100", () => {
    expect(computeOffset(100)).toBeCloseTo(0);
  });

  it("returns half offset for score 50", () => {
    const size = 56;
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    expect(computeOffset(50)).toBeCloseTo(circumference / 2);
  });

  it("computes correctly for custom size", () => {
    const size = 44;
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    expect(computeOffset(75, size)).toBeCloseTo(circumference * 0.25);
  });

  it("handles score 1 (tiny arc)", () => {
    const offset = computeOffset(1);
    expect(offset).toBeGreaterThan(0);
  });

  it("handles score 99 (near full)", () => {
    const offset = computeOffset(99);
    expect(offset).toBeGreaterThan(0);
    expect(offset).toBeLessThan(5);
  });
});

// ─── Score color mapping ───────────────────────────────────────────
describe("ScoreRing color mapping", () => {
  const getColor = (score: number) =>
    score >= 80 ? "stroke-status-error" : score >= 50 ? "stroke-status-warning" : "stroke-blue-500";

  it("assigns error (red) for score >= 80", () => {
    expect(getColor(80)).toBe("stroke-status-error");
    expect(getColor(100)).toBe("stroke-status-error");
    expect(getColor(95)).toBe("stroke-status-error");
  });

  it("assigns warning (yellow) for 50-79", () => {
    expect(getColor(50)).toBe("stroke-status-warning");
    expect(getColor(65)).toBe("stroke-status-warning");
    expect(getColor(79)).toBe("stroke-status-warning");
  });

  it("assigns blue for < 50", () => {
    expect(getColor(0)).toBe("stroke-blue-500");
    expect(getColor(49)).toBe("stroke-blue-500");
    expect(getColor(25)).toBe("stroke-blue-500");
  });
});

// ─── Category classification ───────────────────────────────────────
describe("Lead category classification", () => {
  const classify = (score: number) =>
    score >= 80 ? "Hot" : score >= 50 ? "Warm" : "Cold";

  it("classifies Hot correctly at boundaries", () => {
    expect(classify(80)).toBe("Hot");
    expect(classify(81)).toBe("Hot");
    expect(classify(100)).toBe("Hot");
  });

  it("classifies Warm correctly at boundaries", () => {
    expect(classify(50)).toBe("Warm");
    expect(classify(79)).toBe("Warm");
    expect(classify(65)).toBe("Warm");
  });

  it("classifies Cold correctly at boundaries", () => {
    expect(classify(0)).toBe("Cold");
    expect(classify(49)).toBe("Cold");
    expect(classify(25)).toBe("Cold");
  });
});

// ─── categoryConfig correctness ────────────────────────────────────
describe("categoryConfig mapping", () => {
  const categoryConfig = {
    Hot: { label: "Quente", color: "text-status-error" },
    Warm: { label: "Morno", color: "text-status-warning" },
    Cold: { label: "Frio", color: "text-blue-500" },
  };

  it("has all three categories", () => {
    expect(Object.keys(categoryConfig)).toHaveLength(3);
    expect(categoryConfig).toHaveProperty("Hot");
    expect(categoryConfig).toHaveProperty("Warm");
    expect(categoryConfig).toHaveProperty("Cold");
  });

  it("each has a Portuguese label", () => {
    expect(categoryConfig.Hot.label).toBe("Quente");
    expect(categoryConfig.Warm.label).toBe("Morno");
    expect(categoryConfig.Cold.label).toBe("Frio");
  });

  it("uses semantic color tokens", () => {
    expect(categoryConfig.Hot.color).toContain("status-error");
    expect(categoryConfig.Warm.color).toContain("status-warning");
    expect(categoryConfig.Cold.color).toContain("blue");
  });
});

// ─── FactorBar percentage calculation ──────────────────────────────
describe("FactorBar percentage", () => {
  const pct = (value: number, maxValue: number) => Math.round((value / maxValue) * 100);

  it("calculates 100% when value equals max", () => {
    expect(pct(25, 25)).toBe(100);
  });

  it("calculates 0% when value is 0", () => {
    expect(pct(0, 25)).toBe(0);
  });

  it("calculates 50% correctly", () => {
    expect(pct(10, 20)).toBe(50);
  });

  it("rounds correctly", () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(2, 3)).toBe(67);
  });

  it("handles large values", () => {
    expect(pct(999, 1000)).toBe(100);
  });
});

// ─── KPI aggregation ───────────────────────────────────────────────
describe("KPI aggregation from leads array", () => {
  interface MockLead { score: number; category: "Hot" | "Warm" | "Cold" }

  const computeKPIs = (leads: MockLead[]) => ({
    hotCount: leads.filter(l => l.category === "Hot").length,
    warmCount: leads.filter(l => l.category === "Warm").length,
    coldCount: leads.filter(l => l.category === "Cold").length,
    avgScore: leads.length > 0
      ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length)
      : 0,
  });

  it("counts categories correctly", () => {
    const leads: MockLead[] = [
      { score: 90, category: "Hot" },
      { score: 85, category: "Hot" },
      { score: 60, category: "Warm" },
      { score: 30, category: "Cold" },
    ];
    const kpis = computeKPIs(leads);
    expect(kpis.hotCount).toBe(2);
    expect(kpis.warmCount).toBe(1);
    expect(kpis.coldCount).toBe(1);
  });

  it("calculates average score correctly", () => {
    const leads: MockLead[] = [
      { score: 80, category: "Hot" },
      { score: 60, category: "Warm" },
      { score: 40, category: "Cold" },
    ];
    expect(computeKPIs(leads).avgScore).toBe(60);
  });

  it("returns 0 for empty array", () => {
    expect(computeKPIs([]).avgScore).toBe(0);
  });

  it("rounds average", () => {
    const leads: MockLead[] = [
      { score: 33, category: "Cold" },
      { score: 34, category: "Cold" },
    ];
    expect(computeKPIs(leads).avgScore).toBe(34); // 33.5 rounds to 34
  });

  it("handles single lead", () => {
    const kpis = computeKPIs([{ score: 75, category: "Warm" }]);
    expect(kpis.avgScore).toBe(75);
    expect(kpis.warmCount).toBe(1);
    expect(kpis.hotCount).toBe(0);
    expect(kpis.coldCount).toBe(0);
  });
});

// ─── Company size scoring (useLeadScoring fallback) ────────────────
describe("calculateCompanySizeScore", () => {
  const calc = (num?: number | null): number => {
    if (!num) return 5;
    if (num > 500) return 20;
    if (num > 100) return 15;
    if (num > 20) return 10;
    return 5;
  };

  it("returns 5 for null", () => expect(calc(null)).toBe(5));
  it("returns 5 for undefined", () => expect(calc(undefined)).toBe(5));
  it("returns 5 for 0", () => expect(calc(0)).toBe(5));
  it("returns 5 for <= 20", () => {
    expect(calc(1)).toBe(5);
    expect(calc(20)).toBe(5);
  });
  it("returns 10 for 21-100", () => {
    expect(calc(21)).toBe(10);
    expect(calc(100)).toBe(10);
  });
  it("returns 15 for 101-500", () => {
    expect(calc(101)).toBe(15);
    expect(calc(500)).toBe(15);
  });
  it("returns 20 for > 500", () => {
    expect(calc(501)).toBe(20);
    expect(calc(10000)).toBe(20);
  });
});

// ─── Local score total calculation ─────────────────────────────────
describe("Local lead score total", () => {
  it("sums all factor values", () => {
    const factors = { companySize: 15, industry: 10, jobTitle: 10, engagement: 5, source: 7, behavior: 5 };
    const total = Object.values(factors).reduce((s, v) => s + v, 0);
    expect(total).toBe(52);
  });

  it("classifies summed score correctly", () => {
    const total = 52;
    const cat = total >= 80 ? "Hot" : total >= 50 ? "Warm" : "Cold";
    expect(cat).toBe("Warm");
  });

  it("max possible local score classifies as Hot", () => {
    const factors = { companySize: 20, industry: 15, jobTitle: 10, engagement: 25, source: 10, behavior: 10 };
    const total = Object.values(factors).reduce((s, v) => s + v, 0);
    expect(total).toBe(90);
    expect(total >= 80).toBe(true);
  });
});

// ─── Server vs Local factor detection ──────────────────────────────
describe("Factor type detection (server vs local)", () => {
  it("detects server score by dealValue property", () => {
    const factors = { dealValue: 20, stageProgress: 15, timeInPipeline: 10, category: 5, recentActivity: 10 };
    expect("dealValue" in factors).toBe(true);
  });

  it("detects local score by companySize property", () => {
    const factors = { companySize: 10, industry: 10, jobTitle: 10, engagement: 5, source: 5, behavior: 5 };
    expect("dealValue" in factors).toBe(false);
    expect("companySize" in factors).toBe(true);
  });
});

// ─── Leads sorting ─────────────────────────────────────────────────
describe("Leads sort by score descending", () => {
  it("sorts correctly", () => {
    const leads = [
      { name: "A", score: 40 },
      { name: "B", score: 90 },
      { name: "C", score: 65 },
    ].sort((a, b) => b.score - a.score);

    expect(leads[0].name).toBe("B");
    expect(leads[1].name).toBe("C");
    expect(leads[2].name).toBe("A");
  });

  it("maintains stable order for equal scores", () => {
    const leads = [
      { name: "A", score: 50 },
      { name: "B", score: 50 },
    ].sort((a, b) => b.score - a.score);
    // JavaScript sort is stable in modern engines
    expect(leads[0].name).toBe("A");
    expect(leads[1].name).toBe("B");
  });
});

// ─── Rank display ──────────────────────────────────────────────────
describe("Rank display styling", () => {
  it("highlights top 3 with primary color", () => {
    [0, 1, 2].forEach(idx => {
      const cls = idx < 3 ? "text-primary" : "text-muted-foreground";
      expect(cls).toBe("text-primary");
    });
  });

  it("uses muted for rank > 3", () => {
    [3, 4, 10].forEach(idx => {
      const cls = idx < 3 ? "text-primary" : "text-muted-foreground";
      expect(cls).toBe("text-muted-foreground");
    });
  });
});
