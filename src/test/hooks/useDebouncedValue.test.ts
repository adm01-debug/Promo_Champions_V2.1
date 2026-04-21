import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna o valor inicial sincronamente no primeiro render", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 200));
    expect(result.current).toBe("a");
  });

  it("coalesce múltiplas mudanças rápidas em uma única atualização", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 200),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe("a");

    rerender({ value: "c" });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe("a");

    rerender({ value: "d" });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe("d");
  });

  it("aplica novo delay quando o parâmetro muda em runtime", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "a", delay: 200 } },
    );

    rerender({ value: "b", delay: 50 });
    act(() => { vi.advanceTimersByTime(50); });
    expect(result.current).toBe("b");
  });
});
