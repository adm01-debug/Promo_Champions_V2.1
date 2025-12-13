import { useCallback, useRef } from 'react';

export function useCelebration() {
  const hasPlayedRef = useRef<Set<string>>(new Set());

  const playCelebrationSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a cheerful celebration sound using oscillators
    const playNote = (freq: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    // Victory fanfare notes (C-E-G-C)
    playNote(523.25, now, 0.15);        // C5
    playNote(659.25, now + 0.1, 0.15);  // E5
    playNote(783.99, now + 0.2, 0.15);  // G5
    playNote(1046.50, now + 0.3, 0.3);  // C6 (longer)
  }, []);

  const triggerConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;
    
    // Fire confetti from multiple angles
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

  const celebrate = useCallback((id: string) => {
    if (hasPlayedRef.current.has(id)) return;
    
    hasPlayedRef.current.add(id);
    playCelebrationSound();
    triggerConfetti();
  }, [playCelebrationSound, triggerConfetti]);

  const resetCelebration = useCallback((id: string) => {
    hasPlayedRef.current.delete(id);
  }, []);

  return { celebrate, resetCelebration };
}
