import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAtRiskSettings, AT_RISK_DEFAULTS, sanitize } from "@/hooks/win-loss/useAtRiskSettings";

const STORAGE_KEY = "winloss-at-risk-settings";

describe("useAtRiskSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when storage is empty", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    expect(result.current.settings).toEqual(AT_RISK_DEFAULTS);
    expect(result.current.settings.debug).toBe(false);
    expect(result.current.settings.stageFilter).toEqual([]);
    expect(result.current.settings.keywordFilter).toBe("");
  });

  it("merges partial updates and persists to localStorage", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    act(() => result.current.update({ threshold: 70 }));
    expect(result.current.settings.threshold).toBe(70);
    expect(result.current.settings.limit).toBe(AT_RISK_DEFAULTS.limit);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.settings.threshold).toBe(70);
    expect(raw.version).toBe(3);
  });

  it("persists debug + filter fields", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    act(() =>
      result.current.update({
        debug: true,
        stageFilter: ["Negociação", "Proposta"],
        keywordFilter: "preço",
      }),
    );
    expect(result.current.settings.debug).toBe(true);
    expect(result.current.settings.stageFilter).toEqual(["Negociação", "Proposta"]);
    expect(result.current.settings.keywordFilter).toBe("preço");
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.settings.stageFilter).toEqual(["Negociação", "Proposta"]);
  });

  it("clamps out-of-range values and sanitizes new fields", () => {
    expect(sanitize({ threshold: 150, limit: 999, maxVisible: 50 })).toMatchObject({
      threshold: 100,
      limit: 50,
      maxVisible: 20,
    });
    expect(sanitize({ threshold: -10, limit: 0, maxVisible: 0 })).toMatchObject({
      threshold: 0,
      limit: 5,
      maxVisible: 3,
    });
    // dedup + drop non-strings + trim
    expect(
      sanitize({ stageFilter: ["A", "A", " B ", "", 42 as unknown as string] }).stageFilter,
    ).toEqual(["A", "B"]);
    // keyword trimmed and capped
    const long = "x".repeat(500);
    expect(sanitize({ keywordFilter: "  hello  " }).keywordFilter).toBe("hello");
    expect(sanitize({ keywordFilter: long }).keywordFilter.length).toBe(100);
    // invalid types
    expect(sanitize({ stageFilter: "nope" as unknown as string[] }).stageFilter).toEqual([]);
    expect(sanitize({ keywordFilter: 123 as unknown as string }).keywordFilter).toBe("");
  });

  it("reset restores defaults", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    act(() => result.current.update({ threshold: 80, debug: true, keywordFilter: "x" }));
    act(() => result.current.reset());
    expect(result.current.settings).toEqual(AT_RISK_DEFAULTS);
  });

  it("clearFilters preserves threshold/limit/debug but resets stage+keyword", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    act(() =>
      result.current.update({
        threshold: 75,
        debug: true,
        stageFilter: ["Negociação"],
        keywordFilter: "preço",
      }),
    );
    act(() => result.current.clearFilters());
    expect(result.current.settings.threshold).toBe(75);
    expect(result.current.settings.debug).toBe(true);
    expect(result.current.settings.stageFilter).toEqual([]);
    expect(result.current.settings.keywordFilter).toBe("");
  });

  it("falls back to defaults on invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    const { result } = renderHook(() => useAtRiskSettings());
    expect(result.current.settings).toEqual(AT_RISK_DEFAULTS);
  });

  it("ignores stored payload with wrong version", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, settings: { threshold: 88, limit: 30, maxVisible: 10 } }),
    );
    const { result } = renderHook(() => useAtRiskSettings());
    expect(result.current.settings).toEqual(AT_RISK_DEFAULTS);
  });

  it("migrates v1 payload preserving numeric fields and filling new defaults", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, settings: { threshold: 65, limit: 25, maxVisible: 12 } }),
    );
    const { result } = renderHook(() => useAtRiskSettings());
    expect(result.current.settings.threshold).toBe(65);
    expect(result.current.settings.limit).toBe(25);
    expect(result.current.settings.maxVisible).toBe(12);
    expect(result.current.settings.debug).toBe(false);
    expect(result.current.settings.stageFilter).toEqual([]);
    expect(result.current.settings.keywordFilter).toBe("");
  });

  it("sanitize whitelists reasonCodes (drops invalid)", () => {
    const out = sanitize({
      reasonCodes: ["STAGNATION_HIGH", "INVALID", "AMOUNT_ALIGNED"] as never,
    });
    expect(out.reasonCodes).toEqual(["STAGNATION_HIGH", "AMOUNT_ALIGNED"]);
    expect(sanitize({ reasonCodes: "nope" as never }).reasonCodes).toEqual([]);
  });

  it("migrates v2 payload preserving fields and adding empty reasonCodes", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        settings: {
          threshold: 60,
          limit: 25,
          maxVisible: 10,
          debug: true,
          stageFilter: ["Negociação"],
          keywordFilter: "preço",
        },
      }),
    );
    const { result } = renderHook(() => useAtRiskSettings());
    expect(result.current.settings.threshold).toBe(60);
    expect(result.current.settings.debug).toBe(true);
    expect(result.current.settings.stageFilter).toEqual(["Negociação"]);
    expect(result.current.settings.keywordFilter).toBe("preço");
    expect(result.current.settings.reasonCodes).toEqual([]);
  });

  it("clearFilters also clears reasonCodes", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    act(() =>
      result.current.update({
        threshold: 70,
        reasonCodes: ["STAGNATION_HIGH"],
        stageFilter: ["Negociação"],
      }),
    );
    act(() => result.current.clearFilters());
    expect(result.current.settings.threshold).toBe(70);
    expect(result.current.settings.reasonCodes).toEqual([]);
    expect(result.current.settings.stageFilter).toEqual([]);
  });

  it("debug flag survives unmount/remount (simulates page reload)", () => {
    const first = renderHook(() => useAtRiskSettings());
    act(() => first.result.current.update({ debug: true, threshold: 55 }));
    expect(first.result.current.settings.debug).toBe(true);
    first.unmount();

    // New hook instance reads fresh from localStorage — simulates F5.
    const second = renderHook(() => useAtRiskSettings());
    expect(second.result.current.settings.debug).toBe(true);
    expect(second.result.current.settings.threshold).toBe(55);

    // Toggling off also persists across remount.
    act(() => second.result.current.update({ debug: false }));
    second.unmount();
    const third = renderHook(() => useAtRiskSettings());
    expect(third.result.current.settings.debug).toBe(false);
  });
});
