import { describe, it, expect } from "vitest";
import {
  AT_RISK_PRESETS,
  detectActivePreset,
  getPresetById,
  type AtRiskPresetId,
} from "@/hooks/win-loss/atRiskPresets";
import { AT_RISK_DEFAULTS } from "@/hooks/win-loss/useAtRiskSettings";

describe("atRiskPresets", () => {
  it("expõe exatamente 5 presets, ids únicos, na ordem all → critical", () => {
    expect(AT_RISK_PRESETS).toHaveLength(5);
    const ids = AT_RISK_PRESETS.map((p) => p.id);
    expect(ids).toEqual<AtRiskPresetId[]>(["all", "low", "medium", "high", "critical"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("detectActivePreset retorna o id correto para cada combinação exata", () => {
    expect(detectActivePreset(0, 50)).toBe("all");
    expect(detectActivePreset(40, 20)).toBe("low");
    expect(detectActivePreset(50, 20)).toBe("medium");
    expect(detectActivePreset(65, 15)).toBe("high");
    expect(detectActivePreset(80, 10)).toBe("critical");
  });

  it("detectActivePreset retorna null quando combinação não casa com nenhum preset", () => {
    expect(detectActivePreset(45, 20)).toBeNull();
    expect(detectActivePreset(40, 25)).toBeNull();
    expect(detectActivePreset(100, 100)).toBeNull();
  });

  it("thresholds dos presets coincidem com bordas de severityFromScore", () => {
    const thresholds = AT_RISK_PRESETS.map((p) => p.threshold);
    expect(thresholds).toContain(40); // mínimo de inclusão (low)
    expect(thresholds).toContain(50); // medium
    expect(thresholds).toContain(65); // high
    expect(thresholds).toContain(80); // critical
  });

  it("defaults do useAtRiskSettings resolvem para preset 'low'", () => {
    expect(detectActivePreset(AT_RISK_DEFAULTS.threshold, AT_RISK_DEFAULTS.limit)).toBe("low");
  });

  it("getPresetById devolve o preset correspondente", () => {
    expect(getPresetById("critical")?.threshold).toBe(80);
    expect(getPresetById("all")?.limit).toBe(50);
  });
});
