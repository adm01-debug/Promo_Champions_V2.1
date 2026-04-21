import { describe, it, expect, vi, beforeEach } from "vitest";
import { Children, isValidElement, type ReactNode } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

// Stub recharts — só precisamos da `key` propagada ao ComposedChart para
// inferir qual bandMode/z o componente está usando após o mount.
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

const BAND_MODE_KEY = "winloss-scenario-bandmode";
const CONFIDENCE_Z_KEY = "winloss-scenario-confidence-z";
const LEGACY_SEE_OLS_KEY = "winloss-scenario-see-ols-inflation";

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

const getKey = (): string =>
  screen.getByTestId("scenario-chart-host").getAttribute("data-chart-key") ?? "";

describe("ScenarioForecastChart — persistência de bandMode/confidenceZ no localStorage", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("usa default 'see' / z=1.00 quando localStorage está vazio", () => {
    renderChart();
    expect(getKey()).toMatch(/^scenario-see-z1\.00-/);
  });

  it("restaura bandMode='pi95' a partir do localStorage no mount inicial", () => {
    window.localStorage.setItem(BAND_MODE_KEY, "pi95");
    renderChart();
    expect(getKey()).toMatch(/^scenario-pi95-/);
  });

  it("restaura confidenceZ válido (1.96) a partir do localStorage no mount inicial", () => {
    window.localStorage.setItem(CONFIDENCE_Z_KEY, "1.96");
    renderChart();
    expect(getKey()).toContain("-z1.96-");
  });

  it("ignora confidenceZ fora do range [0.5, 3.0] e cai para 1.00", () => {
    window.localStorage.setItem(CONFIDENCE_Z_KEY, "999");
    renderChart();
    expect(getKey()).toContain("-z1.00-");
  });

  it("ignora confidenceZ não-numérico e cai para 1.00", () => {
    window.localStorage.setItem(CONFIDENCE_Z_KEY, "abc");
    renderChart();
    expect(getKey()).toContain("-z1.00-");
  });

  it("trata bandMode inválido como 'see' (sanitização)", () => {
    window.localStorage.setItem(BAND_MODE_KEY, "qualquer-coisa");
    renderChart();
    expect(getKey()).toMatch(/^scenario-see-/);
  });

  it("escreve em localStorage ao trocar bandMode na UI e restaura no remount", async () => {
    const user = userEvent.setup();
    renderChart();
    expect(getKey()).toMatch(/^scenario-see-/);

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    expect(window.localStorage.getItem(BAND_MODE_KEY)).toBe("pi95");

    // Simula reload: desmonta e remonta limpo — deve restaurar pi95.
    cleanup();
    renderChart();
    expect(getKey()).toMatch(/^scenario-pi95-/);
  });

  it("escreve em localStorage ao trocar z na UI e restaura no remount", async () => {
    const user = userEvent.setup();
    renderChart();
    expect(getKey()).toContain("-z1.00-");

    await user.click(screen.getByRole("button", { name: /Nível de confiança/i }));
    await user.click(document.getElementById("z-1.96") as HTMLElement);
    expect(window.localStorage.getItem(CONFIDENCE_Z_KEY)).toBe("1.96");

    // Simula reload.
    cleanup();
    renderChart();
    expect(getKey()).toContain("-z1.96-");
  });

  it("remove silenciosamente a chave legada 'winloss-scenario-see-ols-inflation' no mount", () => {
    window.localStorage.setItem(LEGACY_SEE_OLS_KEY, "0");
    renderChart();
    expect(window.localStorage.getItem(LEGACY_SEE_OLS_KEY)).toBeNull();
  });
});
