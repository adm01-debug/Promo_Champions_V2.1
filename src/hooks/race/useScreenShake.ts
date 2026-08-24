import { useCallback, useEffect, useState } from 'react';

/**
 * Dispara um pequeno "shake" controlado em ms quando trigger() é chamado.
 * Usar em conjunto com `prefers-reduced-motion` (chamadores devem checar).
 */
export function useScreenShake(durationMs = 280) {
  const [active, setActive] = useState(false);

  const trigger = useCallback(() => {
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => setActive(false), durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs]);

  return { shaking: active, trigger };
}
