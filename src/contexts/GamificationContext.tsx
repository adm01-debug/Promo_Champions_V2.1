import { createContext, useContext } from 'react';
import { gamifiedToast } from '@/components/ui/gamified-toast';

interface GamificationContextType {
  celebrateLevelUp: (
    previousLevel: number,
    newLevel: number,
    rewards?: {
      xp?: number;
      coins?: number;
      title?: string;
      badge?: string;
    }
  ) => void;
  toast: typeof gamifiedToast;
  rewardXP: (amount: number, description?: string) => void;
  rewardCoins: (amount: number, description?: string) => void;
  unlockAchievement: (title: string, description?: string) => void;
  completeQuest: (title: string, description?: string) => void;
  updateStreak: (days: number) => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamificationSafe() {
  return useContext(GamificationContext);
}
