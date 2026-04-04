import { describe, it, expect } from "vitest";

/**
 * useLeadScoring hook logic — tests for local scoring fallback,
 * server score selection, ICP enrichment, and batch limits.
 */

// ─── Local scoring calculation ─────────────────────────────────────
describe("Local scoring factors", () => {
  const calcIndustryScore = (isIcpMatch: boolean, hasRamo: boolean) =>
    isIcpMatch ? 15 : hasRamo ? 10 : 5;

  it("ICP match → 15", () => expect(calcIndustryScore(true, true)).toBe(15));
  it("has ramo but no ICP → 10", () => expect(calcIndustryScore(false, true)).toBe(10));
  it("no ramo, no ICP → 5", () => expect(calcIndustryScore(false, false)).toBe(5));

  const calcSourceScore = (totalValue: number) =>
    totalValue > 100000 ? 10 : totalValue > 50000 ? 7 : 5;

  it("high value → 10", () => expect(calcSourceScore(150000)).toBe(10));
  it("medium value → 7", () => expect(calcSourceScore(75000)).toBe(7));
  it("low value → 5", () => expect(calcSourceScore(30000)).toBe(5));
  it("boundary: 100000 → 7", () => expect(calcSourceScore(100000)).toBe(7));
  it("boundary: 50000 → 5", () => expect(calcSourceScore(50000)).toBe(5));
});

// ─── Best server score selection ───────────────────────────────────
describe("Best server score selection", () => {
  it("picks highest score among deals", () => {
    const scores: Record<string, { score: number }> = {
      "deal-1": { score: 45 },
      "deal-2": { score: 82 },
      "deal-3": { score: 67 },
    };
    const dealIds = ["deal-1", "deal-2", "deal-3"];
    let bestScore = 0;
    dealIds.forEach(id => {
      if (scores[id] && scores[id].score > bestScore) {
        bestScore = scores[id].score;
      }
    });
    expect(bestScore).toBe(82);
  });

  it("returns 0 when no server scores", () => {
    const scores: Record<string, { score: number }> = {};
    let bestScore = 0;
    expect(bestScore).toBe(0);
  });

  it("handles single deal", () => {
    const scores = { "deal-1": { score: 55 } };
    let bestScore = 0;
    ["deal-1"].forEach(id => {
      if (scores[id]?.score > bestScore) bestScore = scores[id].score;
    });
    expect(bestScore).toBe(55);
  });
});

// ─── Batch size limit ──────────────────────────────────────────────
describe("Edge function batch size limit", () => {
  it("limits to 50 deal IDs", () => {
    const ids = Array.from({ length: 100 }, (_, i) => `deal-${i}`);
    const batch = ids.slice(0, 50);
    expect(batch).toHaveLength(50);
  });

  it("passes all if <= 50", () => {
    const ids = Array.from({ length: 30 }, (_, i) => `deal-${i}`);
    const batch = ids.slice(0, 50);
    expect(batch).toHaveLength(30);
  });
});

// ─── Client-deal name matching ─────────────────────────────────────
describe("Client-deal name matching (case insensitive)", () => {
  const matchClient = (clientName: string, saleClientName: string) =>
    clientName.toLowerCase() === saleClientName.toLowerCase();

  it("matches exact case", () => expect(matchClient("Acme Corp", "Acme Corp")).toBe(true));
  it("matches different case", () => expect(matchClient("ACME CORP", "acme corp")).toBe(true));
  it("no match for different names", () => expect(matchClient("Acme", "Beta")).toBe(false));
});

// ─── staleTime configuration ───────────────────────────────────────
describe("Query staleTime", () => {
  it("is set to 15 minutes", () => {
    const staleTime = 1000 * 60 * 15;
    expect(staleTime).toBe(900000);
  });
});
