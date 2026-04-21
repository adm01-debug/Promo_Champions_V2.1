import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useWinLossViewPrefs,
  VIEW_PREFS_DEFAULTS,
  sanitize,
} from "@/hooks/win-loss/useWinLossViewPrefs";

const STORAGE_KEY = "winloss-view-prefs";

describe("useWinLossViewPrefs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when storage is empty", () => {
    const { result } = renderHook(() => useWinLossViewPrefs());
    expect(result.current.prefs).toEqual(VIEW_PREFS_DEFAULTS);
  });

  it("merges partial updates and persists to localStorage", () => {
    const { result } = renderHook(() => useWinLossViewPrefs());
    act(() => result.current.update({ forecastHorizon: 6 }));
    expect(result.current.prefs.forecastHorizon).toBe(6);
    expect(result.current.prefs.granularity).toBe(VIEW_PREFS_DEFAULTS.granularity);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.prefs.forecastHorizon).toBe(6);
    expect(raw.version).toBe(1);
  });

  it("sanitize rejects invalid values and falls back to defaults", () => {
    expect(
      sanitize({
        granularity: "dia" as unknown as "week",
        forecastHorizon: 99 as unknown as 3,
      }),
    ).toEqual(VIEW_PREFS_DEFAULTS);
    expect(sanitize({ granularity: "week", forecastHorizon: 12 })).toEqual({
      granularity: "week",
      forecastHorizon: 12,
    });
  });

  it("reset restores defaults", () => {
    const { result } = renderHook(() => useWinLossViewPrefs());
    act(() => result.current.update({ forecastHorizon: 12, granularity: "week" }));
    act(() => result.current.reset());
    expect(result.current.prefs).toEqual(VIEW_PREFS_DEFAULTS);
  });

  it("falls back to defaults on invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");
    const { result } = renderHook(() => useWinLossViewPrefs());
    expect(result.current.prefs).toEqual(VIEW_PREFS_DEFAULTS);
  });

  it("ignores stored payload with wrong version", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, prefs: { granularity: "week", forecastHorizon: 6 } }),
    );
    const { result } = renderHook(() => useWinLossViewPrefs());
    expect(result.current.prefs).toEqual(VIEW_PREFS_DEFAULTS);
  });
});
