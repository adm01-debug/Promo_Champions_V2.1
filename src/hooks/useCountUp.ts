import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  duration?: number;
  startFrom?: number;
  decimals?: number;
  enabled?: boolean;
}

export function useCountUp(
  end: number,
  { duration = 1200, startFrom = 0, decimals = 0, enabled = true }: UseCountUpOptions = {}
) {
  const [value, setValue] = useState(startFrom);
  const prevEnd = useRef(startFrom);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      setValue(end);
      return;
    }

    const from = prevEnd.current;
    prevEnd.current = end;
    const diff = end - from;
    if (diff === 0) {
      setValue(end);
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + diff * eased;
      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, decimals, enabled]);

  return value;
}
