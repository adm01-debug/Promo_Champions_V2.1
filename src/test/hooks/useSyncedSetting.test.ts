import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock supabase client BEFORE importing the hook.
const upsertMock = vi.fn().mockResolvedValue({ error: null });
const deleteMock = vi.fn().mockResolvedValue({ error: null });
const maybeSingleMock = vi.fn();
const getUserMock = vi.fn();
const onAuthStateChangeMock = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => getUserMock(),
      onAuthStateChange: (cb: unknown) => onAuthStateChangeMock(cb),
    },
    from: (_table: string) => ({
      upsert: (rows: unknown, o?: unknown) => upsertMock(rows, o),
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => maybeSingleMock(),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({
          eq: () => deleteMock(),
        }),
      }),
    }),
  },
}));

import { useSyncedSetting } from "@/hooks/useSyncedSetting";

interface Foo {
  count: number;
  name: string;
}

const DEFAULTS: Foo = { count: 0, name: "" };
const sanitize = (raw: unknown): Foo => {
  const o = (raw && typeof raw === "object" ? raw : {}) as Partial<Foo>;
  return { count: Number(o.count ?? 0), name: String(o.name ?? "") };
};

const opts = {
  key: "test-foo",
  storageKey: "synced-test-foo",
  schemaVersion: 1,
  defaults: DEFAULTS,
  sanitize,
  debounceMs: 10,
};

describe("useSyncedSetting", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    upsertMock.mockResolvedValue({ error: null });
    deleteMock.mockResolvedValue({ error: null });
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    getUserMock.mockResolvedValue({ data: { user: null } });
  });

  it("returns defaults when storage and server are empty", async () => {
    const { result } = renderHook(() => useSyncedSetting(opts));
    expect(result.current.value).toEqual(DEFAULTS);
    await waitFor(() => expect(result.current.syncStatus).toBe("offline"));
  });

  it("update writes localStorage immediately and debounces server upsert", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    const { result } = renderHook(() => useSyncedSetting(opts));
    await waitFor(() => expect(result.current.syncStatus === "synced" || result.current.syncStatus === "offline").toBe(true));

    act(() => result.current.update({ count: 5 }));
    expect(result.current.value.count).toBe(5);
    // Local cache updated immediately
    const raw = JSON.parse(localStorage.getItem("synced-test-foo")!);
    expect(raw.settings.count).toBe(5);
    expect(raw.version).toBe(1);

    await waitFor(() => expect(upsertMock).toHaveBeenCalled());
    const payload = upsertMock.mock.calls[0][0];
    expect(Array.isArray(payload) ? payload[0].value.count : payload.value.count).toBe(5);
  });

  it("server-newer payload overrides local on mount", async () => {
    // Local has older snapshot
    localStorage.setItem(
      "synced-test-foo",
      JSON.stringify({
        version: 1,
        settings: { count: 1, name: "old" },
        updatedAt: "2020-01-01T00:00:00.000Z",
      }),
    );
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    maybeSingleMock.mockResolvedValue({
      data: { value: { count: 99, name: "fresh" }, updated_at: "2030-01-01T00:00:00.000Z" },
      error: null,
    });

    const { result } = renderHook(() => useSyncedSetting(opts));
    await waitFor(() => expect(result.current.value.count).toBe(99));
    expect(result.current.value.name).toBe("fresh");
    expect(result.current.syncStatus).toBe("synced");
  });

  it("local-newer pushes to server during reconcile", async () => {
    localStorage.setItem(
      "synced-test-foo",
      JSON.stringify({
        version: 1,
        settings: { count: 7, name: "local" },
        updatedAt: "2030-01-01T00:00:00.000Z",
      }),
    );
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    maybeSingleMock.mockResolvedValue({
      data: { value: { count: 1, name: "stale" }, updated_at: "2020-01-01T00:00:00.000Z" },
      error: null,
    });

    const { result } = renderHook(() => useSyncedSetting(opts));
    await waitFor(() => expect(upsertMock).toHaveBeenCalled());
    expect(result.current.value.count).toBe(7); // local kept
  });

  it("reset clears local and deletes server row when authed", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    const { result } = renderHook(() => useSyncedSetting(opts));
    await waitFor(() => expect(result.current.syncStatus !== "loading").toBe(true));

    act(() => result.current.update({ count: 3 }));
    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.value).toEqual(DEFAULTS);
    expect(localStorage.getItem("synced-test-foo")).toBeNull();
    expect(deleteMock).toHaveBeenCalled();
  });

  it("offline (no user) keeps working locally", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { result } = renderHook(() => useSyncedSetting(opts));
    await waitFor(() => expect(result.current.syncStatus).toBe("offline"));

    act(() => result.current.update({ name: "local-only" }));
    expect(result.current.value.name).toBe("local-only");
    // No server upsert when no user
    await new Promise((r) => setTimeout(r, 30));
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
