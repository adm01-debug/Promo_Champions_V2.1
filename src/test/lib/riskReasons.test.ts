import { describe, it, expect } from "vitest";
import {
  RISK_REASON_CODES,
  RISK_REASON_LABELS,
  getReasonKindMeta,
  inferReasonCode,
  isRiskReasonCode,
  type RiskReasonCode,
} from "@/lib/winloss/riskReasons";

describe("riskReasons", () => {
  it("inferReasonCode classifies stagnation low vs high", () => {
    expect(inferReasonCode("23 dias sem atualização")).toBe("STAGNATION_LOW");
    expect(inferReasonCode("23 dias sem atualização (média de loss: 18d)")).toBe("STAGNATION_HIGH");
  });

  it("inferReasonCode classifies amount, stage and competitor", () => {
    expect(inferReasonCode("Ticket alinhado ao perfil típico de loss (45.000)")).toBe("AMOUNT_ALIGNED");
    expect(inferReasonCode('Estágio "negotiation" historicamente travado')).toBe("STAGE_STUCK");
    expect(inferReasonCode("Possível pressão competitiva detectada (leilao)")).toBe("COMPETITOR_PRESSURE");
  });

  it("inferReasonCode falls back to CROSSED_SIGNALS for unknown text", () => {
    expect(inferReasonCode("string aleatória")).toBe("CROSSED_SIGNALS");
    expect(inferReasonCode("")).toBe("CROSSED_SIGNALS");
  });

  it("RISK_REASON_LABELS has an entry for every code (exhaustive)", () => {
    for (const code of RISK_REASON_CODES) {
      expect(typeof RISK_REASON_LABELS[code]).toBe("string");
      expect(RISK_REASON_LABELS[code].length).toBeGreaterThan(0);
    }
    expect(Object.keys(RISK_REASON_LABELS).sort()).toEqual([...RISK_REASON_CODES].sort());
  });

  it("getReasonKindMeta returns the correct source per code", () => {
    expect(getReasonKindMeta("STAGNATION_HIGH").source).toBe("stagnation");
    expect(getReasonKindMeta("STAGNATION_LOW").source).toBe("stagnation");
    expect(getReasonKindMeta("AMOUNT_ALIGNED").source).toBe("amount");
    expect(getReasonKindMeta("STAGE_STUCK").source).toBe("stage");
    expect(getReasonKindMeta("COMPETITOR_PRESSURE").source).toBe("competitor");
    expect(getReasonKindMeta("CROSSED_SIGNALS").source).toBe("generic");
  });

  it("getReasonKindMeta exposes contribMax aligned with score caps", () => {
    expect(getReasonKindMeta("STAGNATION_HIGH").contribMax).toBe(50);
    expect(getReasonKindMeta("AMOUNT_ALIGNED").contribMax).toBe(25);
    expect(getReasonKindMeta("STAGE_STUCK").contribMax).toBe(25);
    expect(getReasonKindMeta("COMPETITOR_PRESSURE").contribMax).toBeNull();
  });

  it("isRiskReasonCode whitelists known codes only", () => {
    expect(isRiskReasonCode("STAGNATION_HIGH")).toBe(true);
    expect(isRiskReasonCode("INVALID")).toBe(false);
    expect(isRiskReasonCode(42)).toBe(false);
    expect(isRiskReasonCode(null)).toBe(false);
    // Type assertion just to make sure compile-time export is reachable.
    const c: RiskReasonCode = "AMOUNT_ALIGNED";
    expect(isRiskReasonCode(c)).toBe(true);
  });
});
