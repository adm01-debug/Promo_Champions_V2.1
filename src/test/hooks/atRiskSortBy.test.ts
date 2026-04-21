import { describe, it, expect } from "vitest";
import { sanitize, AT_RISK_DEFAULTS } from "@/hooks/win-loss/useAtRiskSettings";

describe("AtRisk · sortBy", () => {
  it("default is 'score'", () => {
    expect(AT_RISK_DEFAULTS.sortBy).toBe("score");
    expect(sanitize({}).sortBy).toBe("score");
  });

  it("accepts 'recency'", () => {
    expect(sanitize({ sortBy: "recency" }).sortBy).toBe("recency");
  });

  it("rejects invalid values and falls back to default", () => {
    expect(sanitize({ sortBy: "invalid" }).sortBy).toBe("score");
    expect(sanitize({ sortBy: 42 }).sortBy).toBe("score");
    expect(sanitize({ sortBy: null }).sortBy).toBe("score");
  });

  it("legacy payload without sortBy keeps other fields and adds default sortBy", () => {
    const out = sanitize({ threshold: 60, limit: 15 });
    expect(out.sortBy).toBe("score");
    expect(out.threshold).toBe(60);
    expect(out.limit).toBe(15);
  });
});
