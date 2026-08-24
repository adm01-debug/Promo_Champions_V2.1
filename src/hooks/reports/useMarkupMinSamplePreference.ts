import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'reports.markupMinSample';
const DEFAULT_SAMPLE = 1;
export const MIN_SAMPLE_OPTIONS = [1, 3, 5] as const;

export type MinSample = (typeof MIN_SAMPLE_OPTIONS)[number];

function readStored(): MinSample {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return (MIN_SAMPLE_OPTIONS as readonly number[]).includes(n)
      ? (n as MinSample)
      : DEFAULT_SAMPLE;
  } catch {
    return DEFAULT_SAMPLE;
  }
}

/**
 * Preferência persistida da amostra mínima usada no ranking de rentabilidade.
 * Sincroniza entre componentes na mesma aba (CustomEvent) e entre abas (`storage`).
 */
export function useMarkupMinSamplePreference() {
  const [minSample, setMinSample] = useState<MinSample>(readStored);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMinSample(readStored());
    };
    const onLocal = () => setMinSample(readStored());
    window.addEventListener('storage', onStorage);
    window.addEventListener('reports:markupMinSampleChanged', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('reports:markupMinSampleChanged', onLocal);
    };
  }, []);

  const update = useCallback((next: number) => {
    const value = (MIN_SAMPLE_OPTIONS as readonly number[]).includes(next)
      ? (next as MinSample)
      : DEFAULT_SAMPLE;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignora quota / modo privado
    }
    setMinSample(value);
    window.dispatchEvent(new CustomEvent('reports:markupMinSampleChanged'));
  }, []);

  return { minSample, setMinSample: update, options: MIN_SAMPLE_OPTIONS };
}
