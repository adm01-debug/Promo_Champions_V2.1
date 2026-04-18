import { createContext, useContext, type ReactNode } from 'react';
import { useCalmMode } from '@/hooks/race/useCalmMode';

interface RaceCalmContextValue {
  calm: boolean;
  toggle: () => void;
  setCalmMode: (v: boolean) => void;
}

const RaceCalmContext = createContext<RaceCalmContextValue | null>(null);

export function RaceCalmProvider({ children }: { children: ReactNode }) {
  const value = useCalmMode();
  return <RaceCalmContext.Provider value={value}>{children}</RaceCalmContext.Provider>;
}

/**
 * Hook de consumo do modo Calm. Se chamado fora do provider, faz fallback
 * para `useCalmMode()` direto (mantém retrocompatibilidade).
 */
export function useRaceCalm(): RaceCalmContextValue {
  const ctx = useContext(RaceCalmContext);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fallback = useCalmMode();
  return ctx ?? fallback;
}
