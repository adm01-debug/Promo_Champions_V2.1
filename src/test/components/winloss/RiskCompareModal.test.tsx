import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskCompareModal, diffKeywords, buildCompareSummary } from "@/components/win-loss/RiskCompareModal";
import type { AtRiskDealFromPattern } from "@/hooks/win-loss/useAtRiskFromPatterns";

const makeDeal = (overrides: Partial<AtRiskDealFromPattern> = {}): AtRiskDealFromPattern => ({
  sale_id: "deal-1",
  client_name: "Cliente A",
  amount: 50000,
  stage: "Negociação",
  risk_score: 80,
  matched_pattern: "Estagnação crítica",
  suggested_action: "Ligar hoje",
  reasons: ["23 dias sem atualização (média de loss: 18d)"],
  breakdown: {
    stagnation: 40,
    amount_alignment: 25,
    stage_match: 15,
    matched_pattern_label: "Estagnação crítica",
    matched_pattern_type: "stagnation",
    matched_confidence: 0.85,
    reasons: ["23 dias sem atualização"],
    matched_keywords: [],
    raw_score: 80,
    confidence_weight: 0.85,
    final_score: 68,
  },
  ...overrides,
});

describe("RiskCompareModal helpers", () => {
  it("diffKeywords classifies exclusive vs common (case-insensitive)", () => {
    const r = diffKeywords(["leilão", "cotação", "concorrência"], ["COTAÇÃO", "preço"]);
    expect(r.onlyA.map((s) => s.toLowerCase())).toEqual(["leilão", "concorrência"]);
    expect(r.onlyB.map((s) => s.toLowerCase())).toEqual(["preço"]);
    expect(r.common.map((s) => s.toLowerCase())).toEqual(["cotação"]);
  });

  it("buildCompareSummary mentions winning side, delta and dominant pattern", () => {
    const a = makeDeal({ sale_id: "a", client_name: "A" });
    const b = makeDeal({
      sale_id: "b",
      client_name: "B",
      risk_score: 20,
      breakdown: {
        ...makeDeal().breakdown!,
        stagnation: 25,
        amount_alignment: 0,
        stage_match: 15,
        matched_pattern_label: "Ticket fora do ICP",
        matched_pattern_type: "amount",
        matched_confidence: 0.5,
        raw_score: 40,
        confidence_weight: 0.5,
        final_score: 20,
      },
    });
    const summary = buildCompareSummary(a, b);
    expect(summary).toContain("Deal A");
    expect(summary).toContain("48"); // 68 - 20
    expect(summary).toContain("Estagnação crítica");
  });

  it("buildCompareSummary flags 'piso aplicado' when one side had confidence < 0.5", () => {
    const a = makeDeal({ sale_id: "a" });
    const b = makeDeal({
      sale_id: "b",
      breakdown: {
        ...makeDeal().breakdown!,
        matched_confidence: 0.3,
        confidence_weight: 0.5,
        final_score: 20,
        raw_score: 40,
      },
    });
    const summary = buildCompareSummary(a, b);
    expect(summary.toLowerCase()).toContain("piso");
  });
});

describe("RiskCompareModal render", () => {
  it("renders both deals with client names and final scores", () => {
    const a = makeDeal({ sale_id: "a", client_name: "ACME Ltda", risk_score: 80 });
    const b = makeDeal({
      sale_id: "b",
      client_name: "Globex",
      risk_score: 30,
      breakdown: {
        ...makeDeal().breakdown!,
        stagnation: 10,
        amount_alignment: 10,
        stage_match: 10,
        raw_score: 30,
        final_score: 30,
      },
    });
    render(<RiskCompareModal open onOpenChange={vi.fn()} dealA={a} dealB={b} />);
    expect(screen.getByText("ACME Ltda")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    expect(screen.getAllByText("Deal A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Deal B").length).toBeGreaterThan(0);
  });

  it("shows 'piso 0.5' badge when matched_confidence < 0.5 but applied weight is 0.5", () => {
    const a = makeDeal({ sale_id: "a" });
    const b = makeDeal({
      sale_id: "b",
      breakdown: {
        ...makeDeal().breakdown!,
        matched_confidence: 0.3,
        confidence_weight: 0.5,
      },
    });
    render(<RiskCompareModal open onOpenChange={vi.fn()} dealA={a} dealB={b} />);
    expect(screen.getByText(/piso 0\.5/i)).toBeInTheDocument();
  });
});
