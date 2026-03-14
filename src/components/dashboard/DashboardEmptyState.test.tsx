import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { DashboardEmptyState } from "./DashboardEmptyState";

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter future={routerFutureConfig}>{ui}</BrowserRouter>);

describe("DashboardEmptyState", () => {
  it("renders revenue empty state", () => {
    renderWithRouter(<DashboardEmptyState type="revenue" />);
    expect(screen.getByText("Faturamento")).toBeInTheDocument();
    expect(screen.getByText(/Registrar Venda/)).toBeInTheDocument();
  });

  it("renders sales empty state", () => {
    renderWithRouter(<DashboardEmptyState type="sales" />);
    expect(screen.getByText("Vendas")).toBeInTheDocument();
    expect(screen.getByText(/Ir ao Pipeline/)).toBeInTheDocument();
  });

  it("renders clients empty state", () => {
    renderWithRouter(<DashboardEmptyState type="clients" />);
    expect(screen.getByText("Clientes")).toBeInTheDocument();
    expect(screen.getByText(/Adicionar/)).toBeInTheDocument();
  });

  it("renders conversion empty state", () => {
    renderWithRouter(<DashboardEmptyState type="conversion" />);
    expect(screen.getByText("Conversão")).toBeInTheDocument();
    expect(screen.getByText(/Ver Pipeline/)).toBeInTheDocument();
  });

  it("renders CTA as link", () => {
    renderWithRouter(<DashboardEmptyState type="revenue" />);
    const link = screen.getByText(/Registrar Venda/).closest("a");
    expect(link).toHaveAttribute("href", "/vendas");
  });
});
