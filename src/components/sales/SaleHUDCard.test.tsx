import { render, screen, fireEvent } from "@testing-library/react";
import { SaleHUDCard } from "./SaleHUDCard";
import { describe, it, expect, vi } from "vitest";

const mockSale = {
  id: "SALE-001",
  fullId: "uuid-123",
  cliente: "Logística Alpha",
  produto: "Contêiner 40ft",
  sku: "CONT-40",
  status: "qualified",
  statusLabel: "Qualificado",
  data: "19/05/2026",
  valor: 25000,
  ai_prediction_score: 85,
  ai_prediction_reasoning: "Lead demonstrou alto engajamento em reuniões recentes.",
  created_at: "2026-05-19T10:00:00Z",
  client_id: "client-uuid-123"
};

describe("SaleHUDCard", () => {
  it("renders sale information correctly", () => {
    render(<SaleHUDCard sale={mockSale} index={0} />);
    
    expect(screen.getByText("Logística Alpha")).toBeDefined();
    expect(screen.getByText(/SALE-001/)).toBeDefined();
    expect(screen.getByText("Contêiner 40ft")).toBeDefined();
    expect(screen.getByText("R$ 25.000,00")).toBeDefined();
  });

  it("shows AI insights when brain icon is clicked", () => {
    render(<SaleHUDCard sale={mockSale} index={0} />);
    
    const aiButton = screen.getByTitle("Predição de IA");
    fireEvent.click(aiButton);
    
    expect(screen.getByText("Inteligência Preditiva (IA)")).toBeDefined();
    expect(screen.getByText("85%")).toBeDefined();
    expect(screen.getByText(mockSale.ai_prediction_reasoning)).toBeDefined();
  });

  it("applies correct color for high prediction scores", () => {
    render(<SaleHUDCard sale={mockSale} index={0} />);
    
    const aiButton = screen.getByTitle("Predição de IA");
    fireEvent.click(aiButton);
    
    const scoreElement = screen.getByText("85%");
    expect(scoreElement.className).toContain("text-emerald-500");
  });

  it("handles missing AI prediction data gracefully", () => {
    const saleNoAI = { ...mockSale, ai_prediction_score: undefined, ai_prediction_reasoning: undefined };
    render(<SaleHUDCard sale={saleNoAI} index={0} />);
    
    const aiButton = screen.getByTitle("Predição de IA");
    fireEvent.click(aiButton);
    
    expect(screen.getByText("0%")).toBeDefined();
    expect(screen.getByText(/IA está processando/)).toBeDefined();
  });
});
