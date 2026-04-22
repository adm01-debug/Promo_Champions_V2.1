import { describe, it, expect } from "vitest";
import { buildScenarioChartKey, type ScenarioChartKeyPoint } from "@/lib/winloss/scenarioChartKey";

const mk = (over: Partial<ScenarioChartKeyPoint> = {}): ScenarioChartKeyPoint => ({
  period: "2024-01",
  realistic: 50,
  optimistic: 55,
  pessimistic: 45,
  isForecast: false,
  ...over,
});

describe("buildScenarioChartKey", () => {
  it("retorna 'scenario-empty' para data vazia", () => {
    expect(
      buildScenarioChartKey({ data: [], fitN: 0, bandMode: "see", confidenceZ: 1, horizon: 3, stdDev: 0 }),
    ).toBe("scenario-empty");
  });

  it("retorna 'scenario-empty' quando fitN === 0 mesmo com data preenchida", () => {
    expect(
      buildScenarioChartKey({ data: [mk()], fitN: 0, bandMode: "see", confidenceZ: 1, horizon: 3, stdDev: 0 }),
    ).toBe("scenario-empty");
  });

  it("retorna chave 'insufficient' estável para fitN < 3", () => {
    const key = buildScenarioChartKey({
      data: [mk({ period: "2024-01" }), mk({ period: "2024-02" })],
      fitN: 2,
      bandMode: "see",
      confidenceZ: 1,
      horizon: 3,
      stdDev: 0,
    });
    expect(key).toBe("scenario-insufficient-2-2024-01");
  });

  it("é determinística para a mesma entrada (ready)", () => {
    const data = Array.from({ length: 15 }, (_, i) => mk({ period: `p${i}`, realistic: i * 1.1 }));
    const input = { data, fitN: 12, bandMode: "see" as const, confidenceZ: 1, horizon: 3, stdDev: 1.23 };
    const a = buildScenarioChartKey(input);
    const b = buildScenarioChartKey(input);
    expect(a).toBe(b);
    expect(a).toMatch(/^scenario-see-z1\.00-l0\.95-h3-n15-fit12-σ1\.23-[0-9a-f]{8}$/);
  });

  it("muda quando confidenceLevel muda no modo PI", () => {
    const data = Array.from({ length: 15 }, (_, i) => mk({ period: `p${i}`, realistic: i * 1.1 }));
    const base = { data, fitN: 12, bandMode: "pi95" as const, confidenceZ: 1, horizon: 3, stdDev: 1.23 };
    const k95 = buildScenarioChartKey({ ...base, confidenceLevel: 0.95 });
    const k99 = buildScenarioChartKey({ ...base, confidenceLevel: 0.99 });
    const k90 = buildScenarioChartKey({ ...base, confidenceLevel: 0.90 });
    expect(k95).toContain("-l0.95-");
    expect(k99).toContain("-l0.99-");
    expect(k90).toContain("-l0.90-");
    expect(new Set([k90, k95, k99]).size).toBe(3);
  });

  it("marca '-partial' quando há ponto com period undefined ou NaN", () => {
    const data = [
      mk({ period: "p1" }),
      mk({ period: undefined }),
      mk({ period: "p3", realistic: NaN }),
    ];
    const key = buildScenarioChartKey({
      data,
      fitN: 12,
      bandMode: "see",
      confidenceZ: 1,
      horizon: 3,
      stdDev: 1,
    });
    expect(key.endsWith("-partial")).toBe(true);
    expect(key).not.toContain("undefined");
    expect(key).not.toContain("NaN");
  });

  it("produz chaves diferentes para séries distintas de mesmo tamanho (anti-colisão)", () => {
    const a = Array.from({ length: 10 }, (_, i) => mk({ period: `p${i}`, realistic: i }));
    const b = Array.from({ length: 10 }, (_, i) => mk({ period: `p${i}`, realistic: i + 0.1 }));
    const ka = buildScenarioChartKey({ data: a, fitN: 8, bandMode: "see", confidenceZ: 1, horizon: 3, stdDev: 1 });
    const kb = buildScenarioChartKey({ data: b, fitN: 8, bandMode: "see", confidenceZ: 1, horizon: 3, stdDev: 1 });
    expect(ka).not.toBe(kb);
  });
});
