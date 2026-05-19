import { useCallback, useRef, useEffect } from 'react';
import { useCelebration } from "@/hooks/useCelebration";

interface LevelUpEvent {
  salespersonId: string;
  salespersonName: string;
  newLevel: number;
  levelTitle: string;
  levelEmoji: string;
}

interface StreakMilestoneEvent {
  salespersonId: string;
  salespersonName: string;
  streakDays: number;
}

export function useLevelUpCelebration() {
  const { celebrateLevelUp, triggerLevelUpConfetti, sendPushNotification } = useCelebration();
  const celebratedLevelsRef = useRef<Set<string>>(new Set());
  const celebratedMilestonesRef = useRef<Set<string>>(new Set());

  // Clear celebrated events on component unmount
  useEffect(() => {
    return () => {
      celebratedLevelsRef.current.clear();
      celebratedMilestonesRef.current.clear();
    };
  }, []);

  const triggerLevelUp = useCallback((event: LevelUpEvent) => {
    const key = `${event.salespersonId}-level-${event.newLevel}`;
    
    if (celebratedLevelsRef.current.has(key)) return;
    celebratedLevelsRef.current.add(key);

    celebrateLevelUp(
      event.salespersonName,
      event.newLevel,
      event.levelTitle,
      event.levelEmoji
    );
  }, [celebrateLevelUp]);

  const triggerStreakMilestone = useCallback(async (event: StreakMilestoneEvent) => {
    const milestones = [3, 7, 14, 30, 50, 100];
    
    // Find the highest milestone achieved
    const achievedMilestone = milestones.reverse().find(m => event.streakDays >= m);
    if (!achievedMilestone) return;

    const key = `${event.salespersonId}-streak-${achievedMilestone}`;
    if (celebratedMilestonesRef.current.has(key)) return;
    celebratedMilestonesRef.current.add(key);

    // Import confetti dynamically
    const confetti = (await import('canvas-confetti')).default;

    // Fire-themed celebration for streak milestones
    const fireColors = ['#FF6B35', '#FF8F00', '#FFB300', '#FFD54F', '#FF5722', '#E64A19'];
    
    // Initial side bursts
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.7 },
      colors: fireColors,
      zIndex: 10000,
      scalar: 1.2,
    });
    
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.7 },
      colors: fireColors,
      zIndex: 10000,
      scalar: 1.2,
    });

    // Center burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
        colors: fireColors,
        scalar: 1.3,
        zIndex: 10000,
      });
    }, 150);

    // Continuous fire effect
    const duration = 2000;
    const end = Date.now() + duration;
    
    const fireInterval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(fireInterval);
        return;
      }
      
      confetti({
        particleCount: 5,
        angle: 90 + (Math.random() - 0.5) * 30,
        spread: 50,
        origin: { x: 0.3 + Math.random() * 0.4, y: 0.9 },
        colors: fireColors,
        scalar: 0.8,
        gravity: 0.8,
        drift: (Math.random() - 0.5) * 0.5,
        zIndex: 10000,
      });
    }, 50);

    // Final big burst
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFC107', '#FF9800', '#FF5722', '#F44336'],
        scalar: 1.5,
        zIndex: 10000,
      });
    }, duration + 200);

    sendPushNotification(
      '🔥 Sequência Incrível!',
      `${event.salespersonName} completou ${event.streakDays} dias consecutivos!`
    );
  }, [sendPushNotification]);

  const triggerNewRecordCelebration = useCallback(async (
    salespersonName: string,
    newRecord: number
  ) => {
    const confetti = (await import('canvas-confetti')).default;

    // Golden celebration for new record
    const colors = ['#FFD700', '#FFC107', '#FF9800', '#FF5722'];
    
    // Multiple bursts for epic effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.3 + (i * 0.2), y: 0.5 },
          colors: colors,
          zIndex: 9999,
          scalar: 1.3,
        });
      }, i * 150);
    }

    sendPushNotification(
      '🏆 Novo Recorde Pessoal!',
      `${salespersonName} bateu seu recorde com ${newRecord} dias seguidos!`
    );
  }, [sendPushNotification]);

  return {
    triggerLevelUp,
    triggerStreakMilestone,
    triggerNewRecordCelebration,
    triggerLevelUpConfetti,
  };
}
