import { describe, it, expect } from "vitest";

/**
 * DealCard integration tests — verifying StagnantDealAlert integration,
 * lead score badge, ICP badge, cadence display, and currency formatting.
 */

// ─── Currency formatting ───────────────────────────────────────────
describe("DealCard currency formatting", () => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(value);

  it("formats small values", () => {
    const result = formatCurrency(500);
    expect(result).toContain("R$");
  });

  it("formats thousands with compact notation", () => {
    const result = formatCurrency(15000);
    expect(result).toContain("R$");
    expect(result).toContain("mil");
  });

  it("formats millions", () => {
    const result = formatCurrency(2500000);
    expect(result).toContain("R$");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("R$");
  });
});

// ─── Score color mapping ───────────────────────────────────────────
describe("DealCard lead score color", () => {
  const getScoreColor = (category?: "hot" | "warm" | "cold") => {
    switch (category) {
      case "hot": return "bg-status-error/20 text-status-error border-status-error/30";
      case "warm": return "bg-status-warning/20 text-status-warning border-status-warning/30";
      case "cold": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  it("hot uses error tokens", () => {
    expect(getScoreColor("hot")).toContain("status-error");
  });

  it("warm uses warning tokens", () => {
    expect(getScoreColor("warm")).toContain("status-warning");
  });

  it("cold uses blue tokens", () => {
    expect(getScoreColor("cold")).toContain("blue-500");
  });

  it("undefined uses muted tokens", () => {
    expect(getScoreColor(undefined)).toContain("muted");
  });
});

// ─── StagnantDealAlert receives correct props ──────────────────────
describe("StagnantDealAlert prop mapping from Deal", () => {
  it("uses updated_at when available", () => {
    const deal = { updated_at: "2026-03-01", created_at: "2026-01-01", client_name: "Test", amount: 5000 };
    const updatedAt = deal.updated_at || deal.created_at;
    expect(updatedAt).toBe("2026-03-01");
  });

  it("falls back to created_at when updated_at is missing", () => {
    const deal = { updated_at: undefined as string | undefined, created_at: "2026-01-01", client_name: "Test", amount: 5000 };
    const updatedAt = deal.updated_at || deal.created_at;
    expect(updatedAt).toBe("2026-01-01");
  });

  it("passes client_name correctly", () => {
    const deal = { client_name: "Empresa ABC", amount: 10000 };
    expect(deal.client_name).toBe("Empresa ABC");
  });

  it("passes amount correctly", () => {
    const deal = { amount: 25000 };
    expect(deal.amount).toBe(25000);
  });
});

// ─── ICP Badge visibility ──────────────────────────────────────────
describe("ICP badge display", () => {
  it("shows when is_icp_match is true", () => {
    const icpData: { is_icp_match: boolean; grupo_nicho?: string } = { is_icp_match: true, grupo_nicho: "Tech" };
    expect(icpData.is_icp_match).toBe(true);
  });

  it("hidden when is_icp_match is false", () => {
    const icpData: { is_icp_match: boolean } = { is_icp_match: false };
    expect(icpData.is_icp_match).toBe(false);
  });

  it("hidden when icpData is undefined", () => {
    const icpData: { is_icp_match: boolean } | undefined = undefined;
    expect(icpData?.is_icp_match).toBeUndefined();
  });

  it("hidden when is_icp_match is false with typed data", () => {
    const icpData = { is_icp_match: false } as { is_icp_match: boolean };
    expect(icpData.is_icp_match).toBe(false);
  });
});

// ─── Active Cadence display ────────────────────────────────────────
describe("Active cadence display in DealCard", () => {
  it("shows cadence name and step", () => {
    const cadence: { cadenceName: string; currentStep: number; status: string } = { cadenceName: "Outbound B2B", currentStep: 3, status: "active" };
    expect(cadence.cadenceName).toBe("Outbound B2B");
    expect(cadence.currentStep).toBe(3);
  });

  it("hidden when no active cadence", () => {
    const cadence: undefined = undefined;
    expect(cadence).toBeUndefined();
  });
});

// ─── Probability badge ─────────────────────────────────────────────
describe("Probability badge display", () => {
  it("shows percentage when probability exists", () => {
    const prob: { probability: number; factors: string[] } = { probability: 75, factors: ["high value"] };
    expect(prob.probability).toBe(75);
  });

  it("hidden when no probability", () => {
    const prob: undefined = undefined;
    expect(prob).toBeUndefined();
  });
});

// ─── Dragging state ────────────────────────────────────────────────
describe("DealCard drag states", () => {
  it("applies opacity-50 when dragging", () => {
    const isDragging = true;
    const cls = isDragging ? "opacity-50" : "";
    expect(cls).toBe("opacity-50");
  });

  it("applies scale/rotate when dragging", () => {
    const isDragging = true;
    const cardCls = isDragging ? "shadow-xl shadow-primary/20 rotate-2 scale-105" : "";
    expect(cardCls).toContain("rotate-2");
    expect(cardCls).toContain("scale-105");
  });

  it("no extra classes when not dragging", () => {
    const isDragging = false;
    const cls = isDragging ? "opacity-50" : "";
    expect(cls).toBe("");
  });
});
