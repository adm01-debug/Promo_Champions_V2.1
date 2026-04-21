import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SyncStatus = "idle" | "loading" | "syncing" | "synced" | "offline" | "error";

interface StoredEnvelope<T> {
  version: number;
  settings: T;
  /** ISO timestamp of last local mutation (used for conflict resolution). */
  updatedAt?: string;
}

interface Options<T> {
  /** Server-side namespace key, e.g. "winloss-at-risk". */
  key: string;
  /** Hard defaults. */
  defaults: T;
  /** LocalStorage key (cache). */
  storageKey: string;
  /** Schema version for local cache. */
  schemaVersion: number;
  /** Sanitize/migrate any unknown payload (server or local) into a safe T. */
  sanitize: (raw: unknown) => T;
  /** Debounce ms for server upserts. Default 800ms. */
  debounceMs?: number;
}

function readLocal<T>(opts: Options<T>): { value: T; updatedAt: string | null } {
  if (typeof window === "undefined") return { value: opts.defaults, updatedAt: null };
  try {
    const raw = window.localStorage.getItem(opts.storageKey);
    if (!raw) return { value: opts.defaults, updatedAt: null };
    const parsed = JSON.parse(raw) as Partial<StoredEnvelope<T>>;
    if (!parsed || typeof parsed !== "object") return { value: opts.defaults, updatedAt: null };
    // Accept current version OR any prior version (sanitize handles migration).
    if (typeof parsed.version === "number" && parsed.version <= opts.schemaVersion) {
      return {
        value: opts.sanitize((parsed as StoredEnvelope<T>).settings ?? {}),
        updatedAt: parsed.updatedAt ?? null,
      };
    }
    return { value: opts.defaults, updatedAt: null };
  } catch {
    return { value: opts.defaults, updatedAt: null };
  }
}

function writeLocal<T>(opts: Options<T>, value: T, updatedAt: string) {
  if (typeof window === "undefined") return;
  try {
    const env: StoredEnvelope<T> = { version: opts.schemaVersion, settings: value, updatedAt };
    window.localStorage.setItem(opts.storageKey, JSON.stringify(env));
  } catch {
    /* ignore quota errors */
  }
}

function clearLocal(opts: Options<unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(opts.storageKey);
  } catch {
    /* ignore */
  }
}

/**
 * Local-first preference hook with silent server sync.
 *
 * - Mount: returns localStorage instantly; fetches server in background.
 * - Update: writes local immediately; debounced upsert to server.
 * - Conflict: last-write-wins by `updatedAt` (server vs local).
 * - Offline / signed-out: behaves as local-only with `syncStatus = "offline"`.
 */
export function useSyncedSetting<T>(opts: Options<T>) {
  const debounceMs = opts.debounceMs ?? 800;
  const initial = readLocal(opts);
  const [value, setValue] = useState<T>(initial.value);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const localUpdatedAtRef = useRef<string | null>(initial.updatedAt);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(null);

  /** Push current local value to server (debounced caller). */
  const pushToServer = useCallback(
    async (next: T, updatedAt: string) => {
      const userId = userIdRef.current;
      if (!userId) {
        setSyncStatus("offline");
        return;
      }
      setSyncStatus("syncing");
      try {
        const { error } = await supabase
          .from("user_app_settings")
          .upsert(
            [
              {
                user_id: userId,
                key: opts.key,
                value: next as unknown as import("@/integrations/supabase/types").Json,
                updated_at: updatedAt,
              },
            ],
            { onConflict: "user_id,key" },
          );
        setSyncStatus(error ? "error" : "synced");
      } catch {
        setSyncStatus("error");
      }
    },
    [opts.key],
  );

  /** Initial server fetch + reconcile. */
  const reconcile = useCallback(async () => {
    setSyncStatus("loading");
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id ?? null;
      userIdRef.current = userId;
      if (!userId) {
        setSyncStatus("offline");
        return;
      }
      const { data, error } = await supabase
        .from("user_app_settings")
        .select("value, updated_at")
        .eq("key", opts.key)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        setSyncStatus("error");
        return;
      }
      if (!data) {
        // Server empty → push local snapshot (if any user changes ever happened).
        if (localUpdatedAtRef.current) {
          await pushToServer(value, localUpdatedAtRef.current);
        } else {
          setSyncStatus("synced");
        }
        return;
      }
      const serverUpdatedAt = data.updated_at as string;
      const localUpdatedAt = localUpdatedAtRef.current;
      const serverNewer = !localUpdatedAt || serverUpdatedAt > localUpdatedAt;
      if (serverNewer) {
        const sanitized = opts.sanitize(data.value);
        setValue(sanitized);
        localUpdatedAtRef.current = serverUpdatedAt;
        writeLocal(opts, sanitized, serverUpdatedAt);
        setSyncStatus("synced");
      } else {
        // Local newer → push.
        await pushToServer(value, localUpdatedAt!);
      }
    } catch {
      setSyncStatus("offline");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.key]);

  // Initial reconcile + listen for auth changes (login/logout triggers re-sync).
  useEffect(() => {
    reconcile();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        reconcile();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [reconcile]);

  // Refetch on tab focus to pick up cross-device changes.
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") reconcile();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [reconcile]);

  const update = useCallback(
    (partial: Partial<T> | ((prev: T) => T)) => {
      setValue((prev) => {
        const merged =
          typeof partial === "function"
            ? (partial as (p: T) => T)(prev)
            : opts.sanitize({ ...(prev as object), ...(partial as object) });
        const ts = new Date().toISOString();
        localUpdatedAtRef.current = ts;
        writeLocal(opts, merged, ts);
        if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = setTimeout(() => {
          void pushToServer(merged, ts);
        }, debounceMs);
        return merged;
      });
    },
    [opts, pushToServer, debounceMs],
  );

  const reset = useCallback(async () => {
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    setValue(opts.defaults);
    localUpdatedAtRef.current = null;
    clearLocal(opts);
    const userId = userIdRef.current;
    if (userId) {
      try {
        await supabase
          .from("user_app_settings")
          .delete()
          .eq("user_id", userId)
          .eq("key", opts.key);
        setSyncStatus("synced");
      } catch {
        setSyncStatus("error");
      }
    }
  }, [opts]);

  return { value, update, reset, syncStatus };
}
