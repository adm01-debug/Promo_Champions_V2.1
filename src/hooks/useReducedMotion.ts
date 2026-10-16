import { useEffect, useState } from 'react';

/**
 * Lê a media query `prefers-reduced-motion` e retorna true se o usuário pediu menos animação.
 * Componentes podem trocar springs por tweens curtos para acessibilidade.
 */
export function useReducedMotion(): boolean {
  // Lazy init: lê a preferência já na primeira render — evita animar
  // uma única vez antes do effect rodar.
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
