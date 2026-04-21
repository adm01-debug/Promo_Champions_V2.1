import { describe, it, expect, vi, beforeEach } from "vitest";
import { Children, isValidElement, type ReactNode } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

// ───────────────────────────────────────────────────────────────────────────
// Mock recharts so we can capture the `key` prop passed to <ComposedChart>.
// React doesn't expose `key` via props, but we can read it from the only
// child of ResponsiveContainer via React.Children.only(children).key.
// ───────────────────────────────────────────────────────────────────────────
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
        }
      } catch {
        chartKey = null;
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

// Import AFTER vi.mock so the component picks up the stubs.
import { ScenarioForecastChart } from "@/components/win-loss/ScenarioForecastChart";

const makePoints = (n: number): TrendPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    period: `p${i}`,
    wins: 5 + (i % 3),
    losses: 3 + (i % 2),
    winRate: 50 + i,
  }));

const renderChart = (props: Parameters<typeof ScenarioForecastChart>[0]) =>
  render(
    <TooltipProvider>
      <ScenarioForecastChart {...props} />
    </TooltipProvider>,
  );

const getKey = (): string =>
  screen.getByTestId("scenario-chart-host").getAttribute("data-chart-key") ?? "";

describe("ScenarioForecastChart — chartKey reage a filtros", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("muda quando o horizonte muda", () => {
    const points = makePoints(8);
    const { rerender } = renderChart({ points, horizon: 3 });
    const keyA = getKey();
    expect(keyA).toMatch(/^scenario-see-/);

    rerender(
      <TooltipProvider>
        <ScenarioForecastChart points={points} horizon={6} />
      </TooltipProvider>,
    );
    const keyB = getKey();
    expect(keyB).toMatch(/^scenario-see-/);
    expect(keyA).not.toBe(keyB);
  });

  it("muda ao trocar o modo de banda (SEE → PI 95%)", async () => {
    const user = userEvent.setup();
    const points = makePoints(8);
    renderChart({ points, horizon: 3 });
    const keyA = getKey();
    expect(keyA).toMatch(/^scenario-see-/);

    await user.click(screen.getByRole("radio", { name: /Modo PI 95%/i }));
    const keyB = getKey();
    expect(keyB).toMatch(/^scenario-pi95-/);
    expect(keyA).not.toBe(keyB);
  });

  it("muda ao escolher um z diferente no popover de confiança", async () => {
    const user = userEvent.setup();
    const points = makePoints(8);
    renderChart({ points, horizon: 3 });
    const keyA = getKey();
    expect(keyA).toContain("-z1.00-");

    await user.click(screen.getByRole("button", { name: /Nível de confiança/i }));
    await user.click(document.getElementById("z-1.96") as HTMLElement);
    const keyB = getKey();
    expect(keyB).toContain("-z1.96-");
    expect(keyA).not.toBe(keyB);
  });

  it("muda quando os points (filtros externos) mudam", () => {
    const { rerender } = renderChart({ points: makePoints(8), horizon: 3 });
    const keyA = getKey();
    expect(keyA).toContain("-fit");

    rerender(
      <TooltipProvider>
        <ScenarioForecastChart points={makePoints(12)} horizon={3} />
      </TooltipProvider>,
    );
    const keyB = getKey();
    expect(keyB).toContain("-fit");
    expect(keyA).not.toBe(keyB);
  });

  it("permanece estável quando nada muda (anti-flicker)", () => {
    const points = makePoints(8);
    const { rerender } = renderChart({ points, horizon: 3 });
    const keyA = getKey();

    rerender(
      <TooltipProvider>
        <ScenarioForecastChart points={points} horizon={3} />
      </TooltipProvider>,
    );
    const keyB = getKey();
    expect(keyA).toBe(keyB);
  });
});
