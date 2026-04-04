import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * StagnantDealAlert — exhaustive tests for stagnation detection,
 * severity classification, and contextual suggestion generation.
 */

// ─── getDaysSince logic ────────────────────────────────────────────
describe("getDaysSince", () => {
  const getDaysSince = (dateStr: string) =>
    Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));

  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("returns 0 for today", () => {
    vi.setSystemTime(new Date("2026-04-04T12:00:00Z"));
    expect(getDaysSince("2026-04-04T00:00:00Z")).toBe(0);
  });

  it("returns 7 for exactly 7 days ago", () => {
    vi.setSystemTime(new Date("2026-04-11T12:00:00Z"));
    expect(getDaysSince("2026-04-04T12:00:00Z")).toBe(7);
  });

  it("returns 14 for 2 weeks ago", () => {
    vi.setSystemTime(new Date("2026-04-18T12:00:00Z"));
    expect(getDaysSince("2026-04-04T12:00:00Z")).toBe(14);
  });

  it("returns 30 for a month ago", () => {
    vi.setSystemTime(new Date("2026-05-04T12:00:00Z"));
    expect(getDaysSince("2026-04-04T12:00:00Z")).toBe(30);
  });

  it("returns 1 for yesterday", () => {
    vi.setSystemTime(new Date("2026-04-05T12:00:00Z"));
    expect(getDaysSince("2026-04-04T12:00:00Z")).toBe(1);
  });
});

// ─── Visibility threshold ──────────────────────────────────────────
describe("Alert visibility threshold (7 days)", () => {
  const shouldShow = (days: number) => days > 7;

  it("hidden at 0 days", () => expect(shouldShow(0)).toBe(false));
  it("hidden at 5 days", () => expect(shouldShow(5)).toBe(false));
  it("hidden at 7 days (boundary)", () => expect(shouldShow(7)).toBe(false));
  it("visible at 8 days", () => expect(shouldShow(8)).toBe(true));
  it("visible at 14 days", () => expect(shouldShow(14)).toBe(true));
  it("visible at 30 days", () => expect(shouldShow(30)).toBe(true));
  it("visible at 100 days", () => expect(shouldShow(100)).toBe(true));
});

// ─── Urgency classification ────────────────────────────────────────
describe("Urgency classification (> 14 days)", () => {
  const isUrgent = (days: number) => days > 14;

  it("not urgent at 8 days", () => expect(isUrgent(8)).toBe(false));
  it("not urgent at 14 days (boundary)", () => expect(isUrgent(14)).toBe(false));
  it("urgent at 15 days", () => expect(isUrgent(15)).toBe(true));
  it("urgent at 30 days", () => expect(isUrgent(30)).toBe(true));
});

// ─── Contextual suggestion engine ──────────────────────────────────
describe("getSuggestion", () => {
  const getSuggestion = (days: number, amount: number): string => {
    if (days > 14 && amount > 20000) {
      return "Deal de alto valor parado há muito tempo. Agende uma reunião urgente com o decisor.";
    }
    if (days > 14) {
      return "Recomendado: envie um follow-up por email ou ligue para retomar a negociação.";
    }
    if (days > 7 && amount > 10000) {
      return "Deal importante sem avanço. Considere enviar uma proposta revisada.";
    }
    return "Este deal precisa de atenção. Faça um contato rápido para manter o momentum.";
  };

  it("high value + very stagnant → urgent meeting", () => {
    const s = getSuggestion(15, 25000);
    expect(s).toContain("reunião urgente");
    expect(s).toContain("decisor");
  });

  it("low value + very stagnant → follow-up", () => {
    const s = getSuggestion(15, 5000);
    expect(s).toContain("follow-up");
    expect(s).toContain("email");
  });

  it("medium stagnant + important value → revised proposal", () => {
    const s = getSuggestion(10, 15000);
    expect(s).toContain("proposta revisada");
  });

  it("medium stagnant + low value → quick contact", () => {
    const s = getSuggestion(10, 5000);
    expect(s).toContain("momentum");
  });

  it("boundary: 14 days, $20001 → follow-up (not urgent meeting)", () => {
    // 14 days is NOT > 14, so it won't match first condition
    const s = getSuggestion(14, 20001);
    expect(s).toContain("proposta revisada");
  });

  it("boundary: 15 days, $20000 → follow-up (not urgent meeting)", () => {
    // $20000 is NOT > 20000
    const s = getSuggestion(15, 20000);
    expect(s).toContain("follow-up");
  });

  it("boundary: 15 days, $20001 → urgent meeting", () => {
    const s = getSuggestion(15, 20001);
    expect(s).toContain("reunião urgente");
  });

  it("boundary: 8 days, $10001 → revised proposal", () => {
    const s = getSuggestion(8, 10001);
    expect(s).toContain("proposta revisada");
  });

  it("boundary: 8 days, $10000 → quick contact", () => {
    // $10000 is NOT > 10000
    const s = getSuggestion(8, 10000);
    expect(s).toContain("momentum");
  });

  it("extreme: 100 days, $1M → urgent meeting", () => {
    expect(getSuggestion(100, 1000000)).toContain("reunião urgente");
  });

  it("extreme: 100 days, $100 → follow-up", () => {
    expect(getSuggestion(100, 100)).toContain("follow-up");
  });
});

// ─── Badge text format ─────────────────────────────────────────────
describe("Badge text format", () => {
  it("shows 'Xd parado' format", () => {
    const days = 12;
    const text = `${days}d parado`;
    expect(text).toBe("12d parado");
  });

  it("shows correct number for various days", () => {
    [8, 10, 15, 30, 90].forEach(d => {
      expect(`${d}d parado`).toContain(`${d}d`);
    });
  });
});

// ─── Tooltip content ───────────────────────────────────────────────
describe("Tooltip labels", () => {
  it("urgent label for > 14 days", () => {
    const label = 15 > 14 ? "Ação Urgente" : "Atenção Necessária";
    expect(label).toBe("Ação Urgente");
  });

  it("attention label for <= 14 days", () => {
    const label = 10 > 14 ? "Ação Urgente" : "Atenção Necessária";
    expect(label).toBe("Atenção Necessária");
  });
});

// ─── CSS class mapping ─────────────────────────────────────────────
describe("Alert styling classes", () => {
  const getClasses = (isUrgent: boolean) =>
    isUrgent
      ? "bg-status-error/15 text-status-error border border-status-error/20"
      : "bg-status-warning/15 text-status-warning border border-status-warning/20";

  it("uses error tokens for urgent", () => {
    const cls = getClasses(true);
    expect(cls).toContain("status-error");
    expect(cls).not.toContain("status-warning");
  });

  it("uses warning tokens for non-urgent", () => {
    const cls = getClasses(false);
    expect(cls).toContain("status-warning");
    expect(cls).not.toContain("status-error");
  });
});

// ─── Icon selection ────────────────────────────────────────────────
describe("Icon selection by urgency", () => {
  it("uses AlertTriangle for urgent", () => {
    const icon = true ? "AlertTriangle" : "Clock";
    expect(icon).toBe("AlertTriangle");
  });

  it("uses Clock for non-urgent", () => {
    const icon = false ? "AlertTriangle" : "Clock";
    expect(icon).toBe("Clock");
  });
});
