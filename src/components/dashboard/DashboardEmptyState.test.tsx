import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { DashboardEmptyState } from "./DashboardEmptyState";

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("DashboardEmptyState", () => {
  it("renders revenue empty state with step 1 badge", () => {
    renderWithRouter(<DashboardEmptyState type="revenue" />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Registre seu faturamento")).toBeInTheDocument();
    expect(screen.getByText("Registrar Venda")).toBeInTheDocument();
  });

  it("renders sales empty state with step 2 badge", () => {
    renderWithRouter(<DashboardEmptyState type="sales" />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Adicione ao pipeline")).toBeInTheDocument();
    expect(screen.getByText("Ir ao Pipeline")).toBeInTheDocument();
  });

  it("renders clients empty state with step 3 badge", () => {
    renderWithRouter(<DashboardEmptyState type="clients" />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Cadastre clientes")).toBeInTheDocument();
    expect(screen.getByText("Adicionar Cliente")).toBeInTheDocument();
  });

  it("renders conversion empty state with step 4 badge", () => {
    renderWithRouter(<DashboardEmptyState type="conversion" />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Acompanhe conversões")).toBeInTheDocument();
    expect(screen.getByText("Ver Pipeline")).toBeInTheDocument();
  });

  it("step 1 uses primary button variant (filled)", () => {
    renderWithRouter(<DashboardEmptyState type="revenue" />);
    const btn = screen.getByText("Registrar Venda").closest("a");
    // Primary button should NOT have variant="outline" classes
    expect(btn?.className).not.toContain("border-input");
  });

  it("step 2+ uses outline button variant", () => {
    renderWithRouter(<DashboardEmptyState type="sales" />);
    const btn = screen.getByText("Ir ao Pipeline").closest("a");
    expect(btn).toBeInTheDocument();
  });
});
