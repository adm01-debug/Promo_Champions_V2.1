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
});
