import { describe, it, expect, vi, beforeEach } from "vitest";
import { Children, isValidElement, type ReactNode } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

// Captura mutável dos data-points do ComposedChart (mesma técnica de
// ScenarioForecastBandModeSwitch.test.tsx).
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

const PI_LEVEL_KEY = "winloss-scenario-pi-level";
const BAND_MODE_KEY = "winloss-scenario-bandmode";

const NOISE = [0, 4, -3, 2, -5, 6, -2, 3, -4, 5, -1, 4];
const makePoints = (n: number): TrendPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    period: `p${i}`,
    wins: 5 + (i % 3),
    losses: 3 + (i % 2),
    winRate: 50 + i * 0.8 + NOISE[i % NOISE.length],
  }));

const renderChart = () =>
  render(
    <TooltipProvider>
      <ScenarioForecastChart points={makePoints(10)} horizon={6} />
    </TooltipProvider>,
  );

const getKey = () =>
  screen.getByTestId("scenario-chart-host").getAttribute("data-chart-key") ?? "";

const forecastWidths = () =>
  lastChartData
    .filter((p) => p.isForecast)
    .map((p) => Number((p.optimistic - p.pessimistic).toFixed(4)));

const forecastRealistic = () =>
  lastChartData.filter((p) => p.isForecast).map((p) => p.realistic);

const switchToPi = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
};

const openLevelPopover = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /Nível de confiança PI/i }));
};

const pickLevel = async (user: ReturnType<typeof userEvent.setup>, label: "90%" | "95%" | "99%") => {
  await openLevelPopover(user);
  // RadioGroupItem renders as role="radio" with the visible Label as its name
  // via htmlFor association.
  const radio = await screen.findByRole("radio", { name: new RegExp(`^${label}\\s`) });
  await user.click(radio);
};

describe("ScenarioForecastChart — seletor de nível de confiança PI (90/95/99)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    lastChartData = [];
  });

  it("usa default 95% quando localStorage está vazio em modo PI", async () => {
    const user = userEvent.setup();
    renderChart();
    await switchToPi(user);
    expect(getKey()).toContain("-l0.95-");
    // Botão exibe (95%)
    expect(screen.getByRole("button", { name: /Nível de confiança PI/i }).textContent).toMatch(/95%/);
  });

  it("restaura nível 0.99 a partir do localStorage no mount", async () => {
    window.localStorage.setItem(BAND_MODE_KEY, "pi95");
    window.localStorage.setItem(PI_LEVEL_KEY, "0.99");
    renderChart();
    expect(getKey()).toContain("-l0.99-");
    expect(screen.getByRole("button", { name: /Nível de confiança PI/i }).textContent).toMatch(/99%/);
  });

  it("sanitiza valores inválidos no localStorage e cai para 0.95", async () => {
    window.localStorage.setItem(BAND_MODE_KEY, "pi95");
    window.localStorage.setItem(PI_LEVEL_KEY, "abc");
    renderChart();
    expect(getKey()).toContain("-l0.95-");

    cleanup();
    window.localStorage.setItem(PI_LEVEL_KEY, "0.42");
    renderChart();
    expect(getKey()).toContain("-l0.95-");
  });

  it("trocar de 95% → 99% alarga TODAS as bandas de previsão", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(BAND_MODE_KEY, "pi95");
    renderChart();
    const w95 = forecastWidths();
    expect(w95.length).toBeGreaterThan(0);

    await pickLevel(user, "99%");
    const w99 = forecastWidths();
    expect(w99.length).toBe(w95.length);
    w99.forEach((w, i) => {
      expect(w).toBeGreaterThan(w95[i]);
    });
  });

  it("trocar de 95% → 90% estreita TODAS as bandas de previsão", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(BAND_MODE_KEY, "pi95");
    renderChart();
    const w95 = forecastWidths();
    expect(w95.length).toBeGreaterThan(0);

    await pickLevel(user, "90%");
    const w90 = forecastWidths();
    expect(w90.length).toBe(w95.length);
    w90.forEach((w, i) => {
      expect(w).toBeLessThan(w95[i]);
    });
  });

  it("a predição central (realistic) NÃO muda ao trocar de nível", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(BAND_MODE_KEY, "pi95");
    renderChart();
    const r95 = forecastRealistic();

    await pickLevel(user, "99%");
    const r99 = forecastRealistic();
    expect(r99).toEqual(r95);

    await pickLevel(user, "90%");
    const r90 = forecastRealistic();
    expect(r90).toEqual(r95);
  });

  it("chartKey muda ao trocar nível e é idempotente ao restaurar 95%", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(BAND_MODE_KEY, "pi95");
    renderChart();
    const k95 = getKey();
    expect(k95).toContain("-l0.95-");

    await pickLevel(user, "99%");
    const k99 = getKey();
    expect(k99).toContain("-l0.99-");
    expect(k99).not.toBe(k95);

    await pickLevel(user, "95%");
    expect(getKey()).toBe(k95);
  });
});
