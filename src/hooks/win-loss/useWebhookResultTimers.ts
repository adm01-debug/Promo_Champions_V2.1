import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebhookResultTimers(retentionMs: number) {
  const [lastResults, setLastResults] = useState<Map<string, "ok" | "skipped" | "fail">>(new Map());
  const [requestIds, setRequestIds] = useState<Map<string, string>>(new Map());
  const [resultTimestamps, setResultTimestamps] = useState<Map<string, number>>(new Map());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const retentionRef = useRef(retentionMs);

  useEffect(() => {
    retentionRef.current = retentionMs;
  }, [retentionMs]);

  const scheduleClearResult = useCallback((id: string) => {
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);
    
    const ms = retentionRef.current;
    if (!Number.isFinite(ms) || ms <= 0) {
      timersRef.current.delete(id);
      return;
    }

    const t = setTimeout(() => {
      setLastResults((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setResultTimestamps((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setRequestIds((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      timersRef.current.delete(id);
    }, ms);
    timersRef.current.set(id, t);
  }, []);

  useEffect(() => {
    timersRef.current.forEach((t, id) => {
      clearTimeout(t);
      timersRef.current.delete(id);
      const baseTs = resultTimestamps.get(id) ?? Date.now();
      const elapsed = Date.now() - baseTs;
      const remaining = retentionMs - elapsed;
      
      if (!Number.isFinite(retentionMs) || retentionMs <= 0) return;
      if (remaining <= 0) {
        setLastResults((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setResultTimestamps((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        return;
      }
      
      const handle = setTimeout(() => {
        setLastResults((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setResultTimestamps((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        timersRef.current.delete(id);
      }, remaining);
      timersRef.current.set(id, handle);
    });
  }, [retentionMs]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, []);

  return {
    lastResults,
    setLastResults,
    requestIds,
    setRequestIds,
    resultTimestamps,
    setResultTimestamps,
    scheduleClearResult,
  };
}
