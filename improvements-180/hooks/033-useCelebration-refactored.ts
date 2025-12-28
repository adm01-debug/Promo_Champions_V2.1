import { useState, useCallback } from 'react';

interface Celebration {
  type: 'deal_won' | 'achievement' | 'milestone';
  message: string;
  value?: number;
}

export const useCelebration = () => {
  const [active, setActive] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const trigger = useCallback((data: Celebration) => {
    setCelebration(data);
    setActive(true);
    setTimeout(() => setActive(false), 5000);
  }, []);

  return { active, celebration, trigger };
};
