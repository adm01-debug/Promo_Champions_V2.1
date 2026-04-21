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
  });

  it("merges partial updates and persists to localStorage", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    act(() => result.current.update({ threshold: 70 }));
    expect(result.current.settings.threshold).toBe(70);
    expect(result.current.settings.limit).toBe(AT_RISK_DEFAULTS.limit);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.settings.threshold).toBe(70);
    expect(raw.version).toBe(1);
  });

  it("clamps out-of-range values", () => {
    expect(sanitize({ threshold: 150, limit: 999, maxVisible: 50 })).toEqual({
      threshold: 100,
      limit: 50,
      maxVisible: 20,
    });
    expect(sanitize({ threshold: -10, limit: 0, maxVisible: 0 })).toEqual({
      threshold: 0,
      limit: 5,
      maxVisible: 3,
    });
  });

  it("reset restores defaults and clears storage", () => {
    const { result } = renderHook(() => useAtRiskSettings());
    act(() => result.current.update({ threshold: 80 }));
    act(() => result.current.reset());
    expect(result.current.settings).toEqual(AT_RISK_DEFAULTS);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
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
});
