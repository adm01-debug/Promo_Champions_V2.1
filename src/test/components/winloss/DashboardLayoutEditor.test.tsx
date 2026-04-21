/**
 * DashboardLayoutEditor — view mode, modos de edição e fallback de widgets ausentes.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const saveSpy = vi.fn();
let mockLayout: string[] = ["kpi", "trend", "insights"];
let isSaving = false;

vi.mock("@/hooks/win-loss/useUserDashboardLayout", () => ({
  DEFAULT_LAYOUT: ["kpi", "trend", "insights", "scenarios"] as const,
  useUserDashboardLayout: () => ({
    layout: mockLayout,
    isLoading: false,
    save: saveSpy,
    isSaving,
  }),
}));

import { DashboardLayoutEditor } from "@/components/win-loss/DashboardLayoutEditor";

const widgets = {
  kpi: { label: "KPIs", node: <div data-testid="w-kpi">KPI</div> },
  trend: { label: "Tendência", node: <div data-testid="w-trend">Trend</div> },
  insights: { label: "Insights", node: <div data-testid="w-insights">Insights</div> },
  // "scenarios" propositalmente AUSENTE para testar fallback
};

const renderEditor = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <DashboardLayoutEditor widgets={widgets as never} />
    </QueryClientProvider>,
  );
};

describe("DashboardLayoutEditor", () => {
  beforeEach(() => {
    saveSpy.mockReset();
    mockLayout = ["kpi", "trend", "insights"];
    isSaving = false;
  });

  it("renderiza widgets na ordem de layout (view mode)", () => {
    mockLayout = ["insights", "kpi", "trend"];
    renderEditor();
    const rendered = document.querySelectorAll("[data-widget-id]");
    expect(Array.from(rendered).map(el => el.getAttribute("data-widget-id"))).toEqual([
      "insights",
      "kpi",
      "trend",
    ]);
  });

  it("ignora silenciosamente widget ausente (fallback)", () => {
    mockLayout = ["kpi", "scenarios", "trend"]; // scenarios não existe em widgets
    renderEditor();
    expect(screen.getByTestId("w-kpi")).toBeInTheDocument();
    expect(screen.getByTestId("w-trend")).toBeInTheDocument();
    expect(screen.queryByText("scenarios")).not.toBeInTheDocument();
    // Apenas 2 widgets renderizados (scenarios é pulado)
    expect(document.querySelectorAll("[data-widget-id]")).toHaveLength(2);
  });

  it("entra em modo edição ao clicar em Personalizar e mostra 3 ações", () => {
    renderEditor();
    fireEvent.click(screen.getByTestId("winloss-layout-personalize"));
    expect(screen.getByTestId("winloss-layout-reset")).toBeInTheDocument();
    expect(screen.getByTestId("winloss-layout-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("winloss-layout-save")).toBeInTheDocument();
    expect(screen.getByTestId("winloss-layout-edit-list")).toBeInTheDocument();
  });

  it("Salvar fica desabilitado quando draft == layout", () => {
    renderEditor();
    fireEvent.click(screen.getByTestId("winloss-layout-personalize"));
    const saveBtn = screen.getByTestId("winloss-layout-save") as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  it("Padrão substitui draft e habilita Salvar (DEFAULT_LAYOUT difere do atual)", () => {
    mockLayout = ["insights", "kpi", "trend"]; // diferente de DEFAULT
    renderEditor();
    fireEvent.click(screen.getByTestId("winloss-layout-personalize"));
    fireEvent.click(screen.getByTestId("winloss-layout-reset"));
    const saveBtn = screen.getByTestId("winloss-layout-save") as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(false);
    fireEvent.click(saveBtn);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(["kpi", "trend", "insights", "scenarios"]);
  });

  it("Cancelar sai do modo edição sem chamar save", () => {
    renderEditor();
    fireEvent.click(screen.getByTestId("winloss-layout-personalize"));
    fireEvent.click(screen.getByTestId("winloss-layout-cancel"));
    expect(screen.queryByTestId("winloss-layout-edit-list")).not.toBeInTheDocument();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("contador exibe N widgets · M ativos no modo edição", () => {
    mockLayout = ["kpi", "scenarios", "trend"]; // 1 desativado
    renderEditor();
    fireEvent.click(screen.getByTestId("winloss-layout-personalize"));
    expect(screen.getByText(/3 widgets · 2 ativos/)).toBeInTheDocument();
  });
});
