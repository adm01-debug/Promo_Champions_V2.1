import { useState, useEffect, useRef } from 'react';
import { MAX_REPLAY_IDS } from './validateReplayIds';

const RETENTION_STORAGE_KEY = 'winloss.replay.resultRetentionMs';
const SELECTION_STORAGE_PREFIX = 'winloss.replay.selection:';
const SELECTION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const DEFAULT_RETENTION_MS = 30_000;

function readStoredRetention(): number | null {
  try {
    const raw = localStorage.getItem(RETENTION_STORAGE_KEY);
    if (!raw) return null;
    if (raw === 'Infinity') return Number.POSITIVE_INFINITY;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

function selectionKey(subscriptionId: string | null): string | null {
  return subscriptionId ? `${SELECTION_STORAGE_PREFIX}${subscriptionId}` : null;
}

function readStoredSelection(subscriptionId: string | null): string[] {
  const key = selectionKey(subscriptionId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { ids?: unknown; at?: unknown };
    if (typeof parsed?.at === 'number' && Date.now() - parsed.at > SELECTION_MAX_AGE_MS) {
      localStorage.removeItem(key);
      return [];
    }
    if (!Array.isArray(parsed?.ids)) return [];
    return parsed.ids.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function writeStoredSelection(subscriptionId: string | null, ids: string[]) {
  const key = selectionKey(subscriptionId);
  if (!key) return;
  try {
    if (ids.length === 0) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify({ ids, at: Date.now() }));
  } catch {
    // localStorage indisponível — ok
  }
}

/** Minimal delivery shape needed to restore a persisted selection. */
interface ReplayableDelivery {
  id: string;
  succeeded: boolean;
}

export function useWebhookReplayPersistence(
  subscriptionId: string | null,
  data: ReplayableDelivery[] | undefined,
  open: boolean
) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [retentionMs, setRetentionMs] = useState<number>(
    () => readStoredRetention() ?? DEFAULT_RETENTION_MS
  );
  const restoredForRef = useRef<string | null>(null);

  const updateRetention = (ms: number) => {
    setRetentionMs(ms);
    try {
      localStorage.setItem(
        RETENTION_STORAGE_KEY,
        ms === Number.POSITIVE_INFINITY ? 'Infinity' : String(ms)
      );
    } catch {}
  };

  useEffect(() => {
    if (!open || !subscriptionId || !data) return;
    if (restoredForRef.current === subscriptionId) return;

    const stored = readStoredSelection(subscriptionId);
    if (stored.length === 0) {
      restoredForRef.current = subscriptionId;
      return;
    }

    const failedSet = new Set(data.filter(d => !d.succeeded).map(d => d.id));
    const valid = stored.filter(id => failedSet.has(id)).slice(0, MAX_REPLAY_IDS);

    if (valid.length > 0) {
      setSelected(new Set(valid));
    }

    if (valid.length !== stored.length) {
      writeStoredSelection(subscriptionId, valid);
    }
    restoredForRef.current = subscriptionId;
  }, [open, subscriptionId, data]);

  useEffect(() => {
    if (!open) restoredForRef.current = null;
  }, [open, subscriptionId]);

  useEffect(() => {
    if (!subscriptionId) return;
    writeStoredSelection(subscriptionId, Array.from(selected));
  }, [selected, subscriptionId]);

  return {
    selected,
    setSelected,
    retentionMs,
    updateRetention,
  };
}
