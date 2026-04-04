import { useRef, useState, useEffect, useCallback } from "react";

type ConfettiFunction = ((options?: Record<string, unknown>) => Promise<unknown> | null) | null;

const COLORS_LEVEL_UP = ['#FFD700', '#FFA500', '#FF6347', '#9400D3', '#00CED1'];
const COLORS_STREAK = ['#FFD700', '#FFEC8B', '#FFC125', '#DAA520', '#F0E68C'];

export type CelebrationType = 'meta' | 'levelup' | 'record';

export function useCelebrationEffects(playSound: () => void) {
  const [activeCelebration, setActiveCelebration] = useState<CelebrationType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfettiReady, setIsConfettiReady] = useState(false);
  const confettiRef = useRef<ConfettiFunction | null>(null);

  useEffect(() => {
    import('canvas-confetti').then((module) => {
      confettiRef.current = module.default;
      setIsConfettiReady(true);
    });
  }, []);

  const getConfetti = useCallback(async (type: CelebrationType) => {
    let confetti = confettiRef.current;
    if (!confetti) {
      setIsLoading(true);
      setActiveCelebration(type);
      confetti = (await import('canvas-confetti')).default;
      confettiRef.current = confetti as unknown as ConfettiFunction;
      setIsLoading(false);
      return confetti;
    }
    setActiveCelebration(type);
    return confetti;
  }, []);

  const handleTestMeta = useCallback(async () => {
    if (activeCelebration || isLoading) return;
    const confetti = await getConfetti('meta');
    if (!confetti) return;
    playSound();

    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    confetti({ ...defaults, particleCount: 50, spread: 26, startVelocity: 55, origin: { x: 0.2, y: 0.7 } });
    confetti({ ...defaults, particleCount: 70, spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.8, y: 0.7 } });
    confetti({ ...defaults, particleCount: 80, spread: 120, startVelocity: 45, origin: { x: 0.5, y: 0.7 } });
    setTimeout(() => setActiveCelebration(null), 2000);
  }, [activeCelebration, isLoading, getConfetti, playSound]);

  const handleTestLevelUp = useCallback(async () => {
    if (activeCelebration || isLoading) return;
    const confetti = await getConfetti('levelup');
    if (!confetti) return;
    playSound();
    setTimeout(() => playSound(), 300);

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: COLORS_LEVEL_UP, zIndex: 9999 });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: COLORS_LEVEL_UP, zIndex: 9999 });
      if (Date.now() < animationEnd) requestAnimationFrame(frame);
    };
    frame();
    setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: COLORS_LEVEL_UP, zIndex: 9999, scalar: 1.5 }), 500);
    setTimeout(() => setActiveCelebration(null), 3500);
  }, [activeCelebration, isLoading, getConfetti, playSound]);

  const handleTestStreakRecord = useCallback(async () => {
    if (activeCelebration || isLoading) return;
    const confetti = await getConfetti('record');
    if (!confetti) return;
    playSound();

    confetti({ particleCount: 80, spread: 70, origin: { x: 0.3, y: 0.6 }, colors: COLORS_STREAK, zIndex: 9999 });
    setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.7, y: 0.6 }, colors: COLORS_STREAK, zIndex: 9999 }), 200);
    setTimeout(() => { playSound(); confetti({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.5 }, colors: COLORS_STREAK, zIndex: 9999, scalar: 1.3 }); }, 400);
    setTimeout(() => setActiveCelebration(null), 2500);
  }, [activeCelebration, isLoading, getConfetti, playSound]);

  return { activeCelebration, isLoading, isConfettiReady, handleTestMeta, handleTestLevelUp, handleTestStreakRecord };
}
