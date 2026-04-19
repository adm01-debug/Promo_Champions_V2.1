import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRaceCalm } from '@/contexts/RaceCalmContext';

/**
 * Detecta troca de view mode e dispara um pequeno "zoom de TV F1".
 * Em reduced-motion ou Calm Mode, o efeito vira um cross-fade simples (200ms).
 */
export function useRaceViewModeTransition(mode: string) {
  const reduced = useReducedMotion();
  const { calm } = useRaceCalm();
  const prevRef = useRef<string>(mode);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');

  useEffect(() => {
    if (prevRef.current === mode) return;
    prevRef.current = mode;
    setPhase('out');
    const t1 = window.setTimeout(() => setPhase('in'), 150);
    const t2 = window.setTimeout(() => setPhase('idle'), 450);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [mode]);

  const subdued = reduced || calm;
  const style: React.CSSProperties = (() => {
    if (phase === 'idle') return { opacity: 1, filter: 'none', transform: 'none' };
    if (subdued) {
      return phase === 'out'
        ? { opacity: 0.4, transition: 'opacity 150ms ease-out' }
        : { opacity: 1, transition: 'opacity 200ms ease-in' };
    }
    return phase === 'out'
      ? {
          opacity: 0.55,
          filter: 'blur(6px)',
          transform: 'scale(1.04)',
          transition: 'opacity 150ms cubic-bezier(0.22,0.61,0.36,1), filter 150ms, transform 150ms',
        }
      : {
          opacity: 1,
          filter: 'blur(0)',
          transform: 'scale(1)',
          transition: 'opacity 300ms cubic-bezier(0.16,1,0.3,1), filter 300ms, transform 300ms',
        };
  })();

  return { phase, style, transitioning: phase !== 'idle' } as const;
}
