import { describe, it, expect, vi, beforeEach } from "vitest";
import { Children, isValidElement, type ReactNode } from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

// Captura mutável dos data-points enviados ao ComposedChart, atualizada
// a cada render. Permite comparar largura de banda entre SEE e PI 95%.
type ChartPoint = {
  period: string;
  realistic: number;
  optimistic: number;
  pessimistic: number;
  isForecast: boolean;
};
let lastChartData: ChartPoint[] = [];

vi.mock("recharts", () => {
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>;
  const Empty = () => null;
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => {
      let chartKey: string | null = null;
      try {
        const only = Children.only(children);
        if (isValidElement(only)) {
          chartKey = (only.key as string | null) ?? null;
          const props = only.props as { data?: ChartPoint[] };
          if (Array.isArray(props.data)) lastChartData = props.data;
        }
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

// Série com ruído real em torno da tendência: garante SEE > 0 (residuais não-nulos),
// caso contrário todas as bandas colapsariam para zero e os testes não distinguiriam
// SEE de PI 95%.
const NOISE = [0, 4, -3, 2, -5, 6, -2, 3, -4, 5, -1, 4];
const makePoints = (n: number): TrendPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    period: `p${i}`,
    wins: 5 + (i % 3),
    losses: 3 + (i % 2),
    winRate: 50 + i * 0.8 + NOISE[i % NOISE.length],
  }));

const renderChart = (horizon: 3 | 6 | 12 = 6) =>
  render(
    <TooltipProvider>
      <ScenarioForecastChart points={makePoints(10)} horizon={horizon} />
    </TooltipProvider>,
  );

const getKey = () =>
  screen.getByTestId("scenario-chart-host").getAttribute("data-chart-key") ?? "";

const forecastWidths = () =>
  lastChartData
    .filter((p) => p.isForecast)
    .map((p) => Number((p.optimistic - p.pessimistic).toFixed(4)));

describe("ScenarioForecastChart — alternar SEE ↔ PI 95% remonta e altera bandas", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    lastChartData = [];
  });

  it("a chartKey muda de prefixo (scenario-see → scenario-pi95) ao alternar", async () => {
    const user = userEvent.setup();
    renderChart();

    const keySee = getKey();
    expect(keySee).toMatch(/^scenario-see-/);

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    const keyPi = getKey();
    expect(keyPi).toMatch(/^scenario-pi95-/);
    expect(keyPi).not.toBe(keySee);
  });

  it("o hash da assinatura muda ao alternar SEE → PI 95%", async () => {
    const user = userEvent.setup();
    renderChart();

    const hashSee = getKey().match(/-([0-9a-f]{8})$/)?.[1];
    expect(hashSee).toBeTruthy();

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    const hashPi = getKey().match(/-([0-9a-f]{8})$/)?.[1];
    expect(hashPi).toBeTruthy();
    expect(hashPi).not.toBe(hashSee);
  });

  it("retornar de PI 95% para SEE restaura a chave original (idempotente)", async () => {
    const user = userEvent.setup();
    renderChart();

    const keySeeInicial = getKey();

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    expect(getKey()).toMatch(/^scenario-pi95-/);

    await user.click(screen.getByRole("radio", { name: /Modo SEE/i }));
    expect(getKey()).toBe(keySeeInicial);
  });

  it("as larguras das bandas de previsão crescem ao alternar SEE → PI 95%", async () => {
    const user = userEvent.setup();
    renderChart();

    const widthsSee = forecastWidths();
    expect(widthsSee.length).toBeGreaterThan(0);
    expect(widthsSee.every((w) => w > 0)).toBe(true);

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));

    // PI 95% usa multiplicador t-Student (>1) com a mesma fórmula de inflação:
    // bandas devem ser estritamente mais largas em todos os steps de previsão.
    const widthsPi = forecastWidths();
    expect(widthsPi.length).toBe(widthsSee.length);
    widthsPi.forEach((w, i) => {
      expect(w).toBeGreaterThan(widthsSee[i]);
    });
  });

  it("a banda PI 95% se alarga conforme o horizonte avança", async () => {
    const user = userEvent.setup();
    renderChart(6);
    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));

    const widths = forecastWidths();
    expect(widths.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeGreaterThanOrEqual(widths[i - 1]);
    }
    expect(widths[widths.length - 1]).toBeGreaterThan(widths[0]);
  });

  it("pontos históricos têm banda colapsada (otimista = pessimista) em ambos os modos", async () => {
    const user = userEvent.setup();
    renderChart();

    const histSee = lastChartData.filter((p) => !p.isForecast);
    expect(histSee.length).toBeGreaterThan(0);
    histSee.forEach((p) => {
      expect(p.optimistic).toBe(p.pessimistic);
    });

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    const histPi = lastChartData.filter((p) => !p.isForecast);
    histPi.forEach((p) => {
      expect(p.optimistic).toBe(p.pessimistic);
    });
  });

  it("a predição central (realistic) é a MESMA em SEE e PI 95% — só a banda muda", async () => {
    const user = userEvent.setup();
    renderChart();

    const realisticSee = lastChartData
      .filter((p) => p.isForecast)
      .map((p) => p.realistic);

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    const realisticPi = lastChartData
      .filter((p) => p.isForecast)
      .map((p) => p.realistic);

    expect(realisticPi).toEqual(realisticSee);
  });

  it("ida-e-volta rápida (SEE→PI→SEE) não fica presa em estado intermediário", async () => {
    const user = userEvent.setup();
    renderChart();
    const k0 = getKey();

    await act(async () => {
      await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    });
    const k1 = getKey();

    await act(async () => {
      await user.click(screen.getByRole("radio", { name: /Modo SEE/i }));
    });
    const k2 = getKey();

    expect(k0).toMatch(/^scenario-see-/);
    expect(k1).toMatch(/^scenario-pi95-/);
    expect(k2).toMatch(/^scenario-see-/);
    expect(k1).not.toBe(k0);
    expect(k2).toBe(k0);
  });
});
