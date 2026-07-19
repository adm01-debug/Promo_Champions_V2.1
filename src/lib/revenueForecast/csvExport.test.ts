import { describe, it, expect } from "vitest";
import { buildRevenueForecastCsv } from "./csvExport";
import type { ForecastResult } from "./forecastEngine";

const fixture: ForecastResult = {
  history: [
    { period: "2025-01", revenue: 1000, isForecast: false },
    { period: "2025-02", revenue: 1500, isForecast: false },
  ],
  forecast: [
    { period: "2025-03", p10: 800, p50: 1200, p90: 1600, isForecast: true },
    { period: "2025-04", p10: 900, p50: 1400, p90: 1900, isForecast: true },
  ],
  summary: {
    trend: "up",
    nextPeriodP50: 1200,
    horizonTotalP10: 1700,
    horizonTotalP50: 2600,
    horizonTotalP90: 3500,
  },
  ensemble: { weights: { holtWinters: 0.5, linear: 0.3, monteCarlo: 0.2 } },
} as ForecastResult;

describe("buildRevenueForecastCsv", () => {
  it("emite header + linhas de história e forecast", () => {
    const csv = buildRevenueForecastCsv(fixture);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("period,type,actual,p10,p50,p90");
    expect(lines).toHaveLength(5);
    expect(lines[1]).toBe("2025-01,history,1000.00,,,");
    expect(lines[3]).toBe("2025-03,forecast,,800.00,1200.00,1600.00");
  });

  it("escapa períodos com vírgula", () => {
    const csv = buildRevenueForecastCsv({
      ...fixture,
      history: [{ period: "Q1,2025", revenue: 10, isForecast: false }],
      forecast: [],
    });
    expect(csv).toContain('"Q1,2025",history,10.00');
  });

  it("adiciona prefixo ' em campo que começa com = para neutralizar injeção CSV (linha 24)", () => {
    const csv = buildRevenueForecastCsv({
      ...fixture,
      history: [{ period: "=CMD", revenue: 100, isForecast: false }],
      forecast: [],
    });
    // The period "=CMD" should be escaped to "'=CMD" to prevent formula injection
    expect(csv).toContain("'=CMD");
  });

  it("deixa em branco valores não-finitos", () => {
    const csv = buildRevenueForecastCsv({
      ...fixture,
      forecast: [{ period: "2025-05", p10: NaN, p50: 100, p90: Infinity, isForecast: true }],
      history: [],
    });
    expect(csv).toContain("2025-05,forecast,,,100.00,");
  });
});
