import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Opts {
  /** Em ms — quando atingido, ativa modo descanso. Default 10min. */
  fatigueThresholdMs?: number;
  /** Notifica via toast 1x quando atingir o limite. */
  notify?: boolean;
}

/**
 * Track contínuo de tempo na sessão da arena.
 * Após `fatigueThresholdMs`, retorna `fatigued = true` para componentes
 * reduzirem microinterações automaticamente.
 */
export function useSessionDuration({ fatigueThresholdMs = 10 * 60 * 1000, notify = true }: Opts = {}) {
  const [elapsed, setElapsed] = useState(0);
  const [fatigued, setFatigued] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const notifiedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const e = now - startedAtRef.current;
      setElapsed(e);
      if (e >= fatigueThresholdMs && !fatigued) {
        setFatigued(true);
        if (notify && !notifiedRef.current) {
          notifiedRef.current = true;
          toast('Modo descanso ativado', {
            description: 'Microinterações reduzidas. Recarregue você também ☕',
            duration: 4500,
          });
        }
      }
    };
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [fatigueThresholdMs, fatigued, notify]);

  return { elapsed, fatigued };
}
