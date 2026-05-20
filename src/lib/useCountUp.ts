import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to `end` over `duration` ms using easeOutExpo.
 * Returns the current animated value.
 */
export function useCountUp(end: number, duration = 1200, decimals = 0): number {
  const [value, setValue] = useState(0);
  // Mirrors the last rendered value so a new animation resumes from where the
  // previous one stopped, even if `end` changes mid-flight.
  const currentValue = useRef(0);
  const rafId = useRef<number>();

  useEffect(() => {
    const start = currentValue.current;
    const diff = end - start;
    if (diff === 0) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + diff * eased;
      currentValue.current = current;
      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [end, duration, decimals]);

  return value;
}
