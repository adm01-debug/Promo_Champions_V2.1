/**
 * useUserDashboardLayout — persistência por usuário, fallback e merge de novos widgets.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// State shared by mocks
let authUser: { id: string } | null = { id: "user-1" };
let storedRow: { layout: string[] } | null = null;
let upsertSpy: ReturnType<typeof vi.fn>;

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/integrations/supabase/client", () => {
  const select = vi.fn(() => ({
    eq: vi.fn(() => ({
      maybeSingle: vi.fn(async () => ({ data: storedRow, error: null })),
    })),
  }));
  const upsert = (...args: unknown[]) => {
    upsertSpy(...args);
    return Promise.resolve({ error: null });
  };
  return {
    supabase: {
      auth: { getUser: vi.fn(async () => ({ data: { user: authUser } })) },
      from: vi.fn(() => ({ select, upsert })),
    },
  };
});

import { useUserDashboardLayout, DEFAULT_LAYOUT } from "@/hooks/win-loss/useUserDashboardLayout";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};

describe("useUserDashboardLayout", () => {
  beforeEach(() => {
    authUser = { id: "user-1" };
    storedRow = null;
    upsertSpy = vi.fn();
  });

  it("retorna DEFAULT_LAYOUT quando não há usuário autenticado", async () => {
    authUser = null;
    const { result } = renderHook(() => useUserDashboardLayout(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.layout).toEqual([...DEFAULT_LAYOUT]);
  });

  it("retorna DEFAULT_LAYOUT quando o usuário não tem registro", async () => {
    storedRow = null;
    const { result } = renderHook(() => useUserDashboardLayout(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.layout).toEqual([...DEFAULT_LAYOUT]);
  });

  it("retorna o layout salvo na ordem persistida", async () => {
    storedRow = { layout: ["insights", "kpi", "trend"] };
    const { result } = renderHook(() => useUserDashboardLayout(), { wrapper });
    await waitFor(() => expect(result.current.layout[0]).toBe("insights"));
    // os 3 salvos vêm primeiro, na ordem
    expect(result.current.layout.slice(0, 3)).toEqual(["insights", "kpi", "trend"]);
  });

  it("anexa novos widgets ao final quando faltam no layout salvo", async () => {
    storedRow = { layout: ["kpi", "trend"] };
    const { result } = renderHook(() => useUserDashboardLayout(), { wrapper });
    await waitFor(() => expect(result.current.layout.length).toBe(DEFAULT_LAYOUT.length));
    expect(result.current.layout.slice(0, 2)).toEqual(["kpi", "trend"]);
    // todos os widgets default presentes (sem duplicatas)
    const set = new Set(result.current.layout);
    DEFAULT_LAYOUT.forEach(w => expect(set.has(w)).toBe(true));
    expect(set.size).toBe(result.current.layout.length);
  });

  it("usa fallback quando o layout salvo é vazio ou inválido", async () => {
    storedRow = { layout: [] };
    const { result } = renderHook(() => useUserDashboardLayout(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.layout).toEqual([...DEFAULT_LAYOUT]);
  });

  it("save invoca upsert com user_id e layout", async () => {
    const { result } = renderHook(() => useUserDashboardLayout(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      result.current.save(["kpi", "trend", "insights"] as never);
      await new Promise(r => setTimeout(r, 0));
    });
    expect(upsertSpy).toHaveBeenCalledTimes(1);
    const payload = upsertSpy.mock.calls[0][0] as { user_id: string; layout: string[] };
    expect(payload.user_id).toBe("user-1");
    expect(payload.layout).toEqual(["kpi", "trend", "insights"]);
  });
});
