import { useCallback, useRef, useEffect } from 'react';
import { useSoundSettings } from "@/hooks/useSoundSettings";
import { useRecordAchievement } from "@/hooks/gamification/useAchievements";

export function useCelebration() {
  const hasPlayedRef = useRef<Set<string>>(new Set());
  const { playSound } = useSoundSettings();
  const recordAchievementMutation = useRecordAchievement();
  
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

  const triggerLevelUpConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;
    
    // Epic celebration for level up - golden stars and more particles
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#9400D3', '#00CED1'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Big burst in center
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        zIndex: 9999,
        scalar: 1.5,
      });
    }, 500);
  }, []);

  const triggerArenaWinCelebration = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#D946EF', '#0EA5E9']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#D946EF', '#0EA5E9']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Firework burst
    const scalar = 2;
    const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });

    confetti({
      shapes: [triangle],
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      scalar
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
      recordAchievementMutation.mutate(
        {
          salespersonId,
          achievementType: 'daily_goal',
          details: { name: salespersonName },
        },
        {
          onSuccess: (result) => {
            // Check if leveled up - trigger special celebration
            if (result?.levelUpInfo?.leveledUp && salespersonName) {
              setTimeout(() => {
                triggerLevelUpConfetti();
                playSound();
                setTimeout(() => playSound(), 300);
                sendPushNotification(
                  '🎖️ Level Up!',
                  `${salespersonName} subiu para o nível ${result.levelUpInfo!.newLevel}!`
                );
              }, 600);
            }
            
            // Check if new personal record
            if (result?.newRecord) {
              setTimeout(() => {
                playSound();
                triggerConfetti();
                sendPushNotification(
                  '🏆 Novo Recorde Pessoal!',
                  `${salespersonName || 'Vendedor'} bateu seu recorde com ${result.newRecord} dias seguidos!`
                );
              }, result?.levelUpInfo?.leveledUp ? 2000 : 800);
            }
            // Check if near personal record
            else if (result?.nearRecord) {
              setTimeout(() => {
                sendPushNotification(
                  '⚡ Quase lá!',
                  `${salespersonName || 'Vendedor'} está a 1 dia de bater seu recorde de ${result.nearRecord!.best} dias seguidos!`
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
              }, result?.levelUpInfo?.leveledUp ? 3000 : 1500);
            }
          },
        }
      );
    }
  }, [playSound, triggerConfetti, triggerLevelUpConfetti, sendPushNotification, recordAchievementMutation]);

  const celebrateLevelUp = useCallback((
    salespersonName: string,
    newLevel: number,
    levelTitle: string,
    levelEmoji: string
  ) => {
    const id = `levelup-${salespersonName}-${newLevel}`;
    if (hasPlayedRef.current.has(id)) return;
    
    hasPlayedRef.current.add(id);
    
    // Play sound twice for extra impact
    playSound();
    triggerLevelUpConfetti();
    
    // Second sound after short delay
    setTimeout(() => {
      playSound();
    }, 300);

    sendPushNotification(
      `${levelEmoji} Level Up!`,
      `${salespersonName} subiu para o nível ${newLevel} - ${levelTitle}!`
    );
  }, [playSound, triggerLevelUpConfetti, sendPushNotification]);

  const celebrateActivation = useCallback((clientName: string, amount: number) => {
    playSound();
    triggerConfetti();
    sendPushNotification(
      '🚀 NOVA ATIVAÇÃO!',
      `O cliente ${clientName} foi ativado com sucesso! Valor: R$ ${amount.toLocaleString('pt-BR')}`
    );
  }, [playSound, triggerConfetti, sendPushNotification]);

  const resetCelebration = useCallback((id: string) => {
    hasPlayedRef.current.delete(id);
  }, []);

  return { celebrate, celebrateLevelUp, celebrateActivation, resetCelebration, sendPushNotification, triggerLevelUpConfetti };
}
