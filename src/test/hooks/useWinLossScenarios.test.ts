import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWinLossScenarios } from "@/hooks/win-loss/useWinLossScenarios";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

const mkPoints = (rates: number[]): TrendPoint[] =>
  rates.map((winRate, i) => ({
    period: `2026-${String(i + 1).padStart(2, "0")}`,
    wins: 0,
    losses: 0,
    winRate,
  }));

describe("useWinLossScenarios", () => {
  it("returns flat series when fewer than 3 points", () => {
    const { result } = renderHook(() => useWinLossScenarios(mkPoints([50, 60])));
    expect(result.current.fitN).toBe(2);
    expect(result.current.stdDev).toBe(0);
    expect(result.current.series).toHaveLength(2);
    expect(result.current.series.every((p) => !p.isForecast)).toBe(true);
    expect(result.current.series[0].optimistic).toBe(result.current.series[0].pessimistic);
  });

  it("returns flat series when no points", () => {
    const { result } = renderHook(() => useWinLossScenarios([]));
    expect(result.current.fitN).toBe(0);
    expect(result.current.series).toHaveLength(0);
  });

  it("perfect linear data => residual σ ≈ 0 and bands collapse", () => {
    const { result } = renderHook(() =>
      useWinLossScenarios(mkPoints([10, 20, 30, 40, 50])),
    );
    expect(result.current.fitN).toBe(5);
    expect(result.current.stdDev).toBeLessThan(0.0001);
    expect(result.current.slope).toBeCloseTo(10, 5);
    const forecasts = result.current.series.filter((p) => p.isForecast);
    expect(forecasts).toHaveLength(3);
    forecasts.forEach((p) => {
      expect(Math.abs(p.optimistic - p.realistic)).toBeLessThan(0.001);
      expect(Math.abs(p.realistic - p.pessimistic)).toBeLessThan(0.001);
    });
  });

  it("computes residual σ correctly (not population σ around mean)", () => {
    // y = [10, 22, 30, 42, 50] — quase linear. Slope ≈ 10.4, σ residual ≈ 1.26.
    // Crucialmente, σ POPULACIONAL ao redor da média (30.8) seria ≈ 14.7.
    // Esse teste prova que estamos medindo ruído ao redor do trend, NÃO a
    // dispersão dos valores absolutos.
    const points = mkPoints([10, 22, 30, 42, 50]);
    const { result } = renderHook(() => useWinLossScenarios(points));

    // População σ (vs média) — referência manual.
    const ys = points.map((p) => p.winRate);
    const mean = ys.reduce((a, b) => a + b, 0) / ys.length;
    const populationStd = Math.sqrt(ys.reduce((a, y) => a + (y - mean) ** 2, 0) / ys.length);

    expect(populationStd).toBeGreaterThan(14); // ~14.7
    expect(result.current.stdDev).toBeGreaterThan(0.5);
    expect(result.current.stdDev).toBeLessThan(3);
    // O ponto-chave: residual << populacional. Antes do refactor as bandas usavam
    // o populacional, inflando a incerteza. Agora reflete ruído real.
    expect(result.current.stdDev).toBeLessThan(populationStd / 5);
  });

  it("forecast bands widen with horizon", () => {
    const { result } = renderHook(() =>
      useWinLossScenarios(mkPoints([45, 55, 50, 60, 55, 65])),
    );
    const forecasts = result.current.series.filter((p) => p.isForecast);
    expect(forecasts).toHaveLength(3);
    const widths = forecasts.map((p) => p.optimistic - p.pessimistic);
    expect(widths[1]).toBeGreaterThanOrEqual(widths[0]);
    expect(widths[2]).toBeGreaterThanOrEqual(widths[1]);
  });

  it("clamps bands to [0, 100]", () => {
    // Tendência muito forte para cima — projeção deve clampar em 100.
    const { result } = renderHook(() =>
      useWinLossScenarios(mkPoints([70, 80, 90, 95])),
    );
    const forecasts = result.current.series.filter((p) => p.isForecast);
    forecasts.forEach((p) => {
      expect(p.optimistic).toBeLessThanOrEqual(100);
      expect(p.optimistic).toBeGreaterThanOrEqual(0);
      expect(p.pessimistic).toBeLessThanOrEqual(100);
      expect(p.pessimistic).toBeGreaterThanOrEqual(0);
      expect(p.realistic).toBeLessThanOrEqual(100);
      expect(p.realistic).toBeGreaterThanOrEqual(0);
    });
  });

  it("captures direction of trend (positive vs negative slope)", () => {
    const up = renderHook(() => useWinLossScenarios(mkPoints([40, 50, 60, 70])));
    const down = renderHook(() => useWinLossScenarios(mkPoints([70, 60, 50, 40])));
    expect(up.result.current.slope).toBeGreaterThan(0);
    expect(down.result.current.slope).toBeLessThan(0);
  });

  it("reacts to new points reference (filter change simulation)", () => {
    const { result, rerender } = renderHook(
      ({ pts }: { pts: TrendPoint[] }) => useWinLossScenarios(pts),
      { initialProps: { pts: mkPoints([50, 50, 50, 50]) } },
    );
    const initialSeries = result.current.series;
    expect(result.current.slope).toBeCloseTo(0, 5);

    rerender({ pts: mkPoints([20, 40, 60, 80]) });
    expect(result.current.series).not.toBe(initialSeries);
    expect(result.current.slope).toBeGreaterThan(15);
  });

  it("historical points have collapsed bands (no fan-out before junction)", () => {
    const { result } = renderHook(() =>
      useWinLossScenarios(mkPoints([45, 55, 50, 60, 58])),
    );
    const historical = result.current.series.filter((p) => !p.isForecast);
    historical.forEach((p) => {
      expect(p.optimistic).toBe(p.realistic);
      expect(p.pessimistic).toBe(p.realistic);
    });
  });

  it("pi95 produces wider bands than see for the same data (ratio = t)", () => {
    const points = mkPoints([10, 22, 30, 42, 50]);
    const see = renderHook(() => useWinLossScenarios(points, { forecastSteps: 3, bandMode: "see" })).result.current;
    const pi = renderHook(() => useWinLossScenarios(points, { forecastSteps: 3, bandMode: "pi95" })).result.current;

    expect(pi.bandMode).toBe("pi95");
    expect(pi.tCritical).not.toBeNull();
    expect(see.tCritical).toBeNull();
    // SEE now uses the same OLS PI factor as pi95 (just without t multiplier).
    expect(see.seeUseOlsInflation).toBe(true);

    const seeForecasts = see.series.filter((p) => p.isForecast);
    const piForecasts = pi.series.filter((p) => p.isForecast);

    seeForecasts.forEach((s, i) => {
      const seeWidth = s.optimistic - s.pessimistic;
      const piWidth = piForecasts[i].optimistic - piForecasts[i].pessimistic;
      expect(piWidth).toBeGreaterThan(seeWidth);
      // Ratio must equal tCritical exactly (same shape, t multiplier only).
      expect(piWidth / seeWidth).toBeCloseTo(pi.tCritical!, 9);
    });
  });

  it("pi95 bands widen with horizon and stay clamped to [0, 100]", () => {
    const { result } = renderHook(() =>
      useWinLossScenarios(mkPoints([45, 55, 50, 60, 55, 65]), { forecastSteps: 3, bandMode: "pi95" }),
    );
    const forecasts = result.current.series.filter((p) => p.isForecast);
    expect(forecasts).toHaveLength(3);
    const widths = forecasts.map((p) => p.optimistic - p.pessimistic);
    expect(widths[1]).toBeGreaterThanOrEqual(widths[0]);
    expect(widths[2]).toBeGreaterThanOrEqual(widths[1]);
    forecasts.forEach((p) => {
      expect(p.optimistic).toBeLessThanOrEqual(100);
      expect(p.optimistic).toBeGreaterThanOrEqual(0);
      expect(p.pessimistic).toBeLessThanOrEqual(100);
      expect(p.pessimistic).toBeGreaterThanOrEqual(0);
    });
  });

  it("pi95 with large n approximates 1.96σ at the center of the fit", () => {
    // 35 points around y = 50 + 0.5x with mild noise. df=33 → t≈1.96.
    const ys: number[] = [];
    for (let i = 0; i < 35; i += 1) {
      const noise = ((i * 37) % 7) - 3; // deterministic small noise in [-3, 3]
      ys.push(50 + 0.5 * i + noise);
    }
    const { result } = renderHook(() =>
      useWinLossScenarios(mkPoints(ys), { forecastSteps: 1, bandMode: "pi95" }),
    );
    expect(result.current.tCritical).toBeCloseTo(1.96, 2);
    const forecast = result.current.series.find((p) => p.isForecast)!;
    const width = forecast.optimistic - forecast.pessimistic;
    // Lower bound: at least ~2 * 1.96 * σ * sqrt(1 + 1/n) — i.e. ignoring the
    // (x - meanX)² / Sxx term, which is positive. So actual width > 2*1.96*σ*√(1+1/n).
    const sigma = result.current.stdDev;
    const minExpected = 2 * 1.96 * sigma * Math.sqrt(1 + 1 / 35);
    expect(width).toBeGreaterThanOrEqual(minExpected * 0.99);
  });

  it("legacy numeric arg ≡ { forecastSteps, bandMode: 'see', seeUseOlsInflation: true }", () => {
    const points = mkPoints([45, 55, 50, 60, 55, 65]);
    const legacy = renderHook(() => useWinLossScenarios(points, 3)).result.current;
    const explicit = renderHook(() =>
      useWinLossScenarios(points, { forecastSteps: 3, bandMode: "see", seeUseOlsInflation: true }),
    ).result.current;

    expect(legacy.bandMode).toBe("see");
    expect(legacy.seeUseOlsInflation).toBe(true);
    expect(legacy.tCritical).toBeNull();
    expect(legacy.series).toEqual(explicit.series);
    expect(legacy.stdDev).toBe(explicit.stdDev);
    expect(legacy.slope).toBe(explicit.slope);
    expect(legacy.fitN).toBe(explicit.fitN);
  });

  it("opt-in legacy approximation (seeUseOlsInflation=false) reproduces √(1+step/n)", () => {
    const points = mkPoints([45, 55, 50, 60, 55, 65]);
    const legacy = renderHook(() =>
      useWinLossScenarios(points, { forecastSteps: 3, bandMode: "see", seeUseOlsInflation: false }),
    ).result.current;

    const sigma = legacy.stdDev;
    const n = legacy.fitN;
    const forecasts = legacy.series.filter((p) => p.isForecast);

    forecasts.forEach((p, idx) => {
      const step = idx + 1;
      const expectedHalfWidth = sigma * Math.sqrt(1 + step / n);
      const observedHalfWidth = (p.optimistic - p.pessimistic) / 2;
      expect(observedHalfWidth).toBeCloseTo(expectedHalfWidth, 6);
    });
  });

  it("manual worked example: SEE 1σ PI and PI 95% match hand-computed values", () => {
    // y = [10, 14, 19, 22] at x = [0, 1, 2, 3].
    // OLS:
    //   meanX = 1.5, meanY = 16.25
    //   Sxy   = (-1.5)(-6.25)+(-0.5)(-2.25)+(0.5)(2.75)+(1.5)(5.75)
    //         =  9.375     + 1.125      + 1.375     + 8.625      = 20.5
    //   Sxx   = 2.25 + 0.25 + 0.25 + 2.25 = 5
    //   slope = 20.5 / 5 = 4.1
    //   intercept = 16.25 - 4.1*1.5 = 10.1
    //   ŷ     = [10.1, 14.2, 18.3, 22.4]
    //   resid = [-0.1, -0.2, 0.7, -0.4]
    //   SSE   = 0.01 + 0.04 + 0.49 + 0.16 = 0.70
    //   dof   = 2, σ = √(0.70/2) = √0.35 ≈ 0.5916079783
    //   t(2)  = 4.303
    // For step = 1 → x = 4:
    //   factor = √(1 + 1/4 + (4-1.5)²/5) = √(1 + 0.25 + 1.25) = √2.5 ≈ 1.5811388301
    //   width_see  = σ · factor                ≈ 0.9354143467
    //   width_pi95 = t · width_see             ≈ 4.025087774
    //   base       = 10.1 + 4.1*4 = 26.5
    const points = mkPoints([10, 14, 19, 22]);

    const see = renderHook(() => useWinLossScenarios(points, { forecastSteps: 1, bandMode: "see" })).result.current;
    const pi = renderHook(() => useWinLossScenarios(points, { forecastSteps: 1, bandMode: "pi95" })).result.current;

    // Fit parameters
    expect(see.slope).toBeCloseTo(4.1, 6);
    expect(see.intercept).toBeCloseTo(10.1, 6);
    expect(see.meanX).toBeCloseTo(1.5, 6);
    expect(see.sxx).toBeCloseTo(5, 6);
    expect(see.sse).toBeCloseTo(0.7, 6);
    expect(see.dof).toBe(2);
    expect(see.stdDev).toBeCloseTo(Math.sqrt(0.35), 6);
    expect(pi.tCritical).toBeCloseTo(4.303, 3);

    // Forecast step=1 (x=4)
    const seeFcst = see.series.find((p) => p.isForecast)!;
    const piFcst = pi.series.find((p) => p.isForecast)!;

    expect(seeFcst.realistic).toBeCloseTo(26.5, 6);
    expect(piFcst.realistic).toBeCloseTo(26.5, 6);

    const expectedHalfSee = Math.sqrt(0.35) * Math.sqrt(2.5); // ≈ 0.9354143467
    const expectedHalfPi = 4.303 * expectedHalfSee;           // ≈ 4.025087774

    expect((seeFcst.optimistic - seeFcst.pessimistic) / 2).toBeCloseTo(expectedHalfSee, 6);
    expect((piFcst.optimistic - piFcst.pessimistic) / 2).toBeCloseTo(expectedHalfPi, 3);

    // Optimistic / pessimistic absolute values vs hand calc.
    expect(seeFcst.optimistic).toBeCloseTo(26.5 + expectedHalfSee, 6);
    expect(seeFcst.pessimistic).toBeCloseTo(26.5 - expectedHalfSee, 6);
  });

  it("ratio pi95/see ≡ tCritical at every step (analytic property of new formula)", () => {
    const points = mkPoints([10, 14, 19, 22, 25, 31, 34]);
    const steps = 6;
    const see = renderHook(() => useWinLossScenarios(points, { forecastSteps: steps, bandMode: "see" })).result.current;
    const pi = renderHook(() => useWinLossScenarios(points, { forecastSteps: steps, bandMode: "pi95" })).result.current;

    const seeFcst = see.series.filter((p) => p.isForecast);
    const piFcst = pi.series.filter((p) => p.isForecast);
    expect(seeFcst.length).toBe(steps);
    expect(piFcst.length).toBe(steps);

    seeFcst.forEach((s, i) => {
      const seeW = s.optimistic - s.pessimistic;
      const piW = piFcst[i].optimistic - piFcst[i].pessimistic;
      // Skip points where clamping at [0, 100] would distort the ratio.
      const seeNoClamp = s.optimistic < 100 && s.pessimistic > 0;
      const piNoClamp = piFcst[i].optimistic < 100 && piFcst[i].pessimistic > 0;
      if (seeNoClamp && piNoClamp) {
        expect(piW / seeW).toBeCloseTo(pi.tCritical!, 9);
      }
    });
  });

  it("confidenceZ scales SEE band width linearly", () => {
    const points = mkPoints([10, 14, 19, 22, 25, 31, 34]);
    const steps = 6;
    const z1 = renderHook(() =>
      useWinLossScenarios(points, { forecastSteps: steps, bandMode: "see", confidenceZ: 1 }),
    ).result.current;
    const z2 = renderHook(() =>
      useWinLossScenarios(points, { forecastSteps: steps, bandMode: "see", confidenceZ: 2 }),
    ).result.current;
    const z196 = renderHook(() =>
      useWinLossScenarios(points, { forecastSteps: steps, bandMode: "see", confidenceZ: 1.96 }),
    ).result.current;

    const fc1 = z1.series.filter((p) => p.isForecast);
    const fc2 = z2.series.filter((p) => p.isForecast);
    const fc196 = z196.series.filter((p) => p.isForecast);

    fc1.forEach((p, i) => {
      const w1 = p.optimistic - p.pessimistic;
      const w2 = fc2[i].optimistic - fc2[i].pessimistic;
      const w196 = fc196[i].optimistic - fc196[i].pessimistic;
      const noClamp = (q: { optimistic: number; pessimistic: number }) =>
        q.optimistic < 100 && q.pessimistic > 0;
      if (noClamp(p) && noClamp(fc2[i])) expect(w2 / w1).toBeCloseTo(2, 9);
      if (noClamp(p) && noClamp(fc196[i])) expect(w196 / w1).toBeCloseTo(1.96, 9);
    });
    expect(z196.confidenceZ).toBe(1.96);
  });

  it("confidenceZ does not affect bandMode 'pi95'", () => {
    const points = mkPoints([10, 14, 19, 22, 25, 31, 34]);
    const a = renderHook(() =>
      useWinLossScenarios(points, { forecastSteps: 4, bandMode: "pi95", confidenceZ: 1 }),
    ).result.current;
    const b = renderHook(() =>
      useWinLossScenarios(points, { forecastSteps: 4, bandMode: "pi95", confidenceZ: 2.5 }),
    ).result.current;
    a.series.forEach((p, i) => {
      expect(p.optimistic).toBeCloseTo(b.series[i].optimistic, 12);
      expect(p.pessimistic).toBeCloseTo(b.series[i].pessimistic, 12);
    });
  });

  it("confidenceZ also scales the legacy √(1+step/n) approximation", () => {
    const points = mkPoints([10, 14, 19, 22, 25, 31, 34]);
    const steps = 4;
    const z1 = renderHook(() =>
      useWinLossScenarios(points, {
        forecastSteps: steps,
        bandMode: "see",
        seeUseOlsInflation: false,
        confidenceZ: 1,
      }),
    ).result.current;
    const zX = renderHook(() =>
      useWinLossScenarios(points, {
        forecastSteps: steps,
        bandMode: "see",
        seeUseOlsInflation: false,
        confidenceZ: 1.645,
      }),
    ).result.current;

    const f1 = z1.series.filter((p) => p.isForecast);
    const fX = zX.series.filter((p) => p.isForecast);
    f1.forEach((p, i) => {
      const w1 = p.optimistic - p.pessimistic;
      const wX = fX[i].optimistic - fX[i].pessimistic;
      const noClamp = (q: { optimistic: number; pessimistic: number }) =>
        q.optimistic < 100 && q.pessimistic > 0;
      if (noClamp(p) && noClamp(fX[i])) expect(wX / w1).toBeCloseTo(1.645, 9);
    });
  });
});
