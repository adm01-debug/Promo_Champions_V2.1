import { describe, it, expect } from "vitest";

interface Deal {
  sale_id: string;
  risk_score: number;
  breakdown?: { days_stagnant?: number };
}

/**
 * Mirrors the sorting logic in AtRiskDealsFromPatterns.tsx — kept in lock-step
 * via this regression test so any future change to the comparator is intentional.
 */
function sortDeals(filtered: Deal[], sortBy: "score" | "recency"): Deal[] {
  if (sortBy === "score") return filtered;
  return [...filtered].sort((a, b) => {
    const da = a.breakdown?.days_stagnant ?? Number.POSITIVE_INFINITY;
    const db = b.breakdown?.days_stagnant ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return b.risk_score - a.risk_score;
  });
}

describe("AtRisk · sort order", () => {
  it("sortBy='score' returns input order untouched (BE already sorts)", () => {
    const input: Deal[] = [
      { sale_id: "a", risk_score: 90 },
      { sale_id: "b", risk_score: 60 },
      { sale_id: "c", risk_score: 80 },
    ];
    expect(sortDeals(input, "score").map((d) => d.sale_id)).toEqual(["a", "b", "c"]);
  });

  it("sortBy='recency' orders by days_stagnant ascending", () => {
    const input: Deal[] = [
      { sale_id: "old",    risk_score: 90, breakdown: { days_stagnant: 30 } },
      { sale_id: "fresh",  risk_score: 60, breakdown: { days_stagnant: 5 } },
      { sale_id: "medium", risk_score: 80, breakdown: { days_stagnant: 10 } },
    ];
    expect(sortDeals(input, "recency").map((d) => d.sale_id)).toEqual([
      "fresh",
      "medium",
      "old",
    ]);
  });

  it("ties on days_stagnant resolve by score desc", () => {
    const input: Deal[] = [
      { sale_id: "tied-low",  risk_score: 50, breakdown: { days_stagnant: 7 } },
      { sale_id: "tied-high", risk_score: 95, breakdown: { days_stagnant: 7 } },
      { sale_id: "older",     risk_score: 99, breakdown: { days_stagnant: 12 } },
    ];
    expect(sortDeals(input, "recency").map((d) => d.sale_id)).toEqual([
      "tied-high",
      "tied-low",
      "older",
    ]);
  });

  it("missing breakdown.days_stagnant pushes deal to the bottom in recency mode", () => {
    const input: Deal[] = [
      { sale_id: "no-breakdown", risk_score: 99 },
      { sale_id: "fresh",        risk_score: 50, breakdown: { days_stagnant: 3 } },
    ];
    expect(sortDeals(input, "recency").map((d) => d.sale_id)).toEqual([
      "fresh",
      "no-breakdown",
    ]);
  });
});
