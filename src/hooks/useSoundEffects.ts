import { useCallback, useRef, useEffect } from 'react';

type SoundType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'notification' 
  | 'levelUp' 
  | 'achievement'
  | 'swoosh'
  | 'pop';

interface SoundOptions {
  enabled?: boolean;
  volume?: number;
}

// Simple oscillator-based sounds (no external files needed)
const createOscillatorSound = (
  context: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.1
) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gainNode.gain.value = volume;

  // Fade out
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};

const soundConfigs: Record<SoundType, (ctx: AudioContext, vol: number) => void> = {
  click: (ctx, vol) => createOscillatorSound(ctx, 800, 0.05, 'square', vol * 0.3),
  
  success: (ctx, vol) => {
    createOscillatorSound(ctx, 523.25, 0.1, 'sine', vol); // C5
    setTimeout(() => createOscillatorSound(ctx, 659.25, 0.1, 'sine', vol), 100); // E5
    setTimeout(() => createOscillatorSound(ctx, 783.99, 0.15, 'sine', vol), 200); // G5
  },
  
  error: (ctx, vol) => {
    createOscillatorSound(ctx, 200, 0.2, 'sawtooth', vol * 0.5);
    setTimeout(() => createOscillatorSound(ctx, 150, 0.3, 'sawtooth', vol * 0.4), 150);
  },
  
  notification: (ctx, vol) => {
    createOscillatorSound(ctx, 880, 0.1, 'sine', vol);
    setTimeout(() => createOscillatorSound(ctx, 1100, 0.15, 'sine', vol * 0.8), 120);
  },
  
  levelUp: (ctx, vol) => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => createOscillatorSound(ctx, freq, 0.15, 'sine', vol), i * 80);
    });
  },
  
  achievement: (ctx, vol) => {
    const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => createOscillatorSound(ctx, freq, 0.2, 'triangle', vol), i * 100);
    });
  },
  
  swoosh: (ctx, vol) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
  },
  
  pop: (ctx, vol) => {
    createOscillatorSound(ctx, 400, 0.08, 'sine', vol * 0.5);
  },
};

export function useSoundEffects(options: SoundOptions = {}) {
  const { enabled = true, volume = 0.5 } = options;
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on user interaction
    const initContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initContext, { once: true });
    document.addEventListener('keydown', initContext, { once: true });

    return () => {
      document.removeEventListener('click', initContext);
      document.removeEventListener('keydown', initContext);
      audioContextRef.current?.close();
    };
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!enabled) return;

    // Lazy initialize on first play
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      soundConfigs[type](ctx, volume);
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  }, [enabled, volume]);

  return {
    play,
    click: () => play('click'),
    success: () => play('success'),
    error: () => play('error'),
    notification: () => play('notification'),
    levelUp: () => play('levelUp'),
    achievement: () => play('achievement'),
    swoosh: () => play('swoosh'),
    pop: () => play('pop'),
  };
}

// Storage key for sound preferences
const SOUND_ENABLED_KEY = 'salesarena-sound-enabled';

export function useSoundPreference() {
  const getSoundEnabled = useCallback(() => {
    try {
      const stored = localStorage.getItem(SOUND_ENABLED_KEY);
      return stored !== 'false';
    } catch {
      return true;
    }
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    } catch {
      // Ignore storage errors
    }
  }, []);

  return { getSoundEnabled, setSoundEnabled };
}
