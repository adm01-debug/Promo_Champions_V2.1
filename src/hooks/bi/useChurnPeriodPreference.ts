import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'bi.churnPeriod';
const DEFAULT_DAYS = 30;
const ALLOWED = [7, 30, 60, 90] as const;

type AllowedDays = (typeof ALLOWED)[number];

function readStored(): AllowedDays {
  if (typeof window === 'undefined') return DEFAULT_DAYS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return (ALLOWED as readonly number[]).includes(n) ? (n as AllowedDays) : DEFAULT_DAYS;
  } catch {
    return DEFAULT_DAYS;
  }
}

/**
 * Preferência compartilhada de período (dias) para widgets de Churn no BI.
 * Persiste em localStorage e sincroniza entre componentes na mesma aba via
 * CustomEvent + entre abas via evento nativo `storage`.
 */
export function useChurnPeriodPreference() {
  const [days, setDays] = useState<AllowedDays>(readStored);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setDays(readStored());
    };
    const onLocal = () => setDays(readStored());
    window.addEventListener('storage', onStorage);
    window.addEventListener('bi:churnPeriodChanged', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bi:churnPeriodChanged', onLocal);
    };
  }, []);

  const update = useCallback((next: number) => {
    const value = (ALLOWED as readonly number[]).includes(next)
      ? (next as AllowedDays)
      : DEFAULT_DAYS;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore quota / private mode
    }
    setDays(value);
    window.dispatchEvent(new CustomEvent('bi:churnPeriodChanged'));
  }, []);

  return { days, setDays: update, options: ALLOWED };
}
