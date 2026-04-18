import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'race_calm_mode';
const EVENT = 'race-calm-mode-change';

function read(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

/**
 * Modo Calm: desliga partículas, screen-shake, fireworks, neon trails, exhaust.
 * Mantém todas as informações textuais. Persistido em localStorage.
 */
export function useCalmMode() {
  const [calm, setCalm] = useState<boolean>(read);

  useEffect(() => {
    const handler = () => setCalm(read());
    window.addEventListener(EVENT, handler);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) handler();
    });
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const toggle = useCallback(() => {
    setCalm((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
        window.dispatchEvent(new CustomEvent(EVENT));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  const setCalmMode = useCallback((v: boolean) => {
    setCalm(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
      window.dispatchEvent(new CustomEvent(EVENT));
    } catch { /* noop */ }
  }, []);

  return { calm, toggle, setCalmMode };
}
