import { useCallback, useRef, useEffect } from 'react';
import { useSoundSettings } from './useSoundSettings';
import { useRecordAchievement } from './useAchievements';

export function useCelebration() {
  const hasPlayedRef = useRef<Set<string>>(new Set());
  const { playSound } = useSoundSettings();
  const recordAchievement = useRecordAchievement();
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendPushNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'goal-celebration',
        requireInteraction: false,
      });
    }
  }, []);

  const triggerConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;
    
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.2),
      spread: 60,
      origin: { x: 0.5, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.35),
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.8, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.1),
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.6 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.1),
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
    });
  }, []);

  const celebrate = useCallback((id: string, salespersonName?: string, salespersonId?: string) => {
    if (hasPlayedRef.current.has(id)) return;
    
    hasPlayedRef.current.add(id);
    playSound();
    triggerConfetti();
    sendPushNotification(
      '🎉 Meta Batida!',
      salespersonName 
        ? `${salespersonName} atingiu 100% da meta de atividades!` 
        : 'Meta de atividades atingida!'
    );

    // Record achievement in database
    if (salespersonId) {
      recordAchievement.mutate(
        {
          salespersonId,
          achievementType: 'daily_goal',
          details: { name: salespersonName },
        },
        {
          onSuccess: (result) => {
            // Check if near personal record
            if (result?.nearRecord) {
              setTimeout(() => {
                sendPushNotification(
                  '⚡ Quase lá!',
                  `${salespersonName || 'Vendedor'} está a 1 dia de bater seu recorde de ${result.nearRecord.best} dias seguidos!`
                );
              }, 800);
            }

            // Check if a streak milestone was achieved
            if (result?.streakMilestone) {
              // Trigger extra celebration for streak
              setTimeout(() => {
                playSound();
                triggerConfetti();
                sendPushNotification(
                  '🔥 Sequência Incrível!',
                  `${salespersonName || 'Vendedor'} completou ${result.streakMilestone} dias seguidos batendo meta!`
                );
              }, 1500);
            }
          },
        }
      );
    }
  }, [playSound, triggerConfetti, sendPushNotification, recordAchievement]);

  const resetCelebration = useCallback((id: string) => {
    hasPlayedRef.current.delete(id);
  }, []);

  return { celebrate, resetCelebration, sendPushNotification };
}
