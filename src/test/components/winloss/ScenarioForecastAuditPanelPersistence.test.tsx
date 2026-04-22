import { describe, it, expect, vi, beforeEach } from "vitest";
import { Children, isValidElement, type ReactNode } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

vi.mock("recharts", () => {
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>;
  const Empty = () => null;
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => {
      let chartKey: string | null = null;
      try {
        const only = Children.only(children);
        if (isValidElement(only)) chartKey = (only.key as string | null) ?? null;
      } catch {
        /* noop */
      }
      return (
        <div data-testid="scenario-chart-host" data-chart-key={chartKey ?? ""}>
          {children}
        </div>
      );
    },
    ComposedChart: Pass,
    XAxis: Empty,
    YAxis: Empty,
    CartesianGrid: Empty,
    Tooltip: Empty,
    Legend: Empty,
    ReferenceLine: Empty,
    Area: Empty,
    Line: Empty,
  };
});

import { ScenarioForecastChart } from "@/components/win-loss/ScenarioForecastChart";

const AUDIT_OPEN_KEY = "winloss-scenario-audit-open";

const makePoints = (n: number): TrendPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    period: `p${i}`,
    wins: 5 + (i % 3),
    losses: 3 + (i % 2),
    winRate: 50 + i,
  }));

const renderChart = () =>
  render(
    <TooltipProvider>
      <ScenarioForecastChart points={makePoints(8)} horizon={3} />
    </TooltipProvider>,
  );

const getDetails = (): HTMLDetailsElement => {
  const summary = screen.getByText("Auditoria do ajuste");
  const details = summary.closest("details");
  if (!details) throw new Error("Painel de auditoria não encontrado");
  return details as HTMLDetailsElement;
};

describe("ScenarioForecastAuditPanel — persistência do estado open/closed", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("default fechado quando localStorage está vazio", () => {
    renderChart();
    expect(getDetails().open).toBe(false);
  });

  it("restaura aberto quando localStorage='1'", () => {
    window.localStorage.setItem(AUDIT_OPEN_KEY, "1");
    renderChart();
    expect(getDetails().open).toBe(true);
  });

  it("sanitiza valores inválidos como fechado", () => {
    window.localStorage.setItem(AUDIT_OPEN_KEY, "true");
    renderChart();
    expect(getDetails().open).toBe(false);

    cleanup();
    window.localStorage.setItem(AUDIT_OPEN_KEY, "sim");
    renderChart();
    expect(getDetails().open).toBe(false);
  });

  it("toggle pelo summary escreve no localStorage", async () => {
    const user = userEvent.setup();
    renderChart();
    const details = getDetails();
    expect(details.open).toBe(false);

    // Abrir programaticamente (jsdom não dispara toggle no click do summary)
    details.open = true;
    details.dispatchEvent(new Event("toggle"));
    await user.click(document.body); // flush
    expect(window.localStorage.getItem(AUDIT_OPEN_KEY)).toBe("1");

    details.open = false;
    details.dispatchEvent(new Event("toggle"));
    await user.click(document.body);
    expect(window.localStorage.getItem(AUDIT_OPEN_KEY)).toBe("0");
  });

  it("estado aberto sobrevive ao remount", async () => {
    renderChart();
    const details = getDetails();
    details.open = true;
    details.dispatchEvent(new Event("toggle"));

    // Aguarda o effect persistir
    await Promise.resolve();
    expect(window.localStorage.getItem(AUDIT_OPEN_KEY)).toBe("1");

    cleanup();
    renderChart();
    expect(getDetails().open).toBe(true);
  });
});
