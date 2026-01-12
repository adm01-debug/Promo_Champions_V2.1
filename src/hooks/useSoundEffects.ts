import { useCallback, useRef, useEffect } from 'react';

// Audio context singleton for better performance
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

type SoundType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'notification' 
  | 'click' 
  | 'toggle' 
  | 'pop' 
  | 'swoosh'
  | 'levelUp'
  | 'achievement'
  | 'coin';

interface UseSoundEffectsOptions {
  enabled?: boolean;
  volume?: number;
}

// Frequency patterns for different sounds
const soundPatterns: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  success: {
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5
    durations: [0.1, 0.1, 0.15],
    type: 'sine'
  },
  error: {
    frequencies: [200, 150],
    durations: [0.15, 0.2],
    type: 'square'
  },
  warning: {
    frequencies: [440, 350, 440],
    durations: [0.1, 0.1, 0.1],
    type: 'triangle'
  },
  notification: {
    frequencies: [880, 1100],
    durations: [0.08, 0.12],
    type: 'sine'
  },
  click: {
    frequencies: [600],
    durations: [0.03],
    type: 'square'
  },
  toggle: {
    frequencies: [800, 1000],
    durations: [0.05, 0.05],
    type: 'sine'
  },
  pop: {
    frequencies: [400, 800],
    durations: [0.02, 0.05],
    type: 'sine'
  },
  swoosh: {
    frequencies: [300, 600, 1200],
    durations: [0.05, 0.05, 0.05],
    type: 'sawtooth'
  },
  levelUp: {
    frequencies: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
    durations: [0.1, 0.1, 0.1, 0.2],
    type: 'sine'
  },
  achievement: {
    frequencies: [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5],
    durations: [0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.15],
    type: 'sine'
  },
  coin: {
    frequencies: [1500, 2000],
    durations: [0.05, 0.1],
    type: 'square'
  }
};

/**
 * useSoundEffects - Hook for playing UI sound effects
 * Uses Web Audio API for low latency and no external files
 */
export function useSoundEffects(options: UseSoundEffectsOptions = {}) {
  const { enabled = true, volume = 0.3 } = options;
  const isPlayingRef = useRef(false);
  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);

  // Update refs when options change
  useEffect(() => {
    enabledRef.current = enabled;
    volumeRef.current = volume;
  }, [enabled, volume]);

  const playSound = useCallback(async (type: SoundType) => {
    if (!enabledRef.current || isPlayingRef.current) return;

    try {
      const ctx = getAudioContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const pattern = soundPatterns[type];
      if (!pattern) return;

      isPlayingRef.current = true;

      let startTime = ctx.currentTime;

      pattern.frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = pattern.type;
        oscillator.frequency.setValueAtTime(freq, startTime);

        // Apply volume with envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volumeRef.current, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + pattern.durations[index]);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + pattern.durations[index]);

        startTime += pattern.durations[index];
      });

      // Reset playing flag after all sounds complete
      const totalDuration = pattern.durations.reduce((a, b) => a + b, 0);
      setTimeout(() => {
        isPlayingRef.current = false;
      }, totalDuration * 1000);

    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Sound effect failed:', error);
      }
      isPlayingRef.current = false;
    }
  }, []);

  // Convenience methods for common sounds
  const playSuccess = useCallback(() => playSound('success'), [playSound]);
  const playError = useCallback(() => playSound('error'), [playSound]);
  const playWarning = useCallback(() => playSound('warning'), [playSound]);
  const playNotification = useCallback(() => playSound('notification'), [playSound]);
  const playClick = useCallback(() => playSound('click'), [playSound]);
  const playToggle = useCallback(() => playSound('toggle'), [playSound]);
  const playPop = useCallback(() => playSound('pop'), [playSound]);
  const playSwoosh = useCallback(() => playSound('swoosh'), [playSound]);
  const playLevelUp = useCallback(() => playSound('levelUp'), [playSound]);
  const playAchievement = useCallback(() => playSound('achievement'), [playSound]);
  const playCoin = useCallback(() => playSound('coin'), [playSound]);

  return {
    playSound,
    playSuccess,
    playError,
    playWarning,
    playNotification,
    playClick,
    playToggle,
    playPop,
    playSwoosh,
    playLevelUp,
    playAchievement,
    playCoin,
    enabled,
  };
}

// Hook to get/set sound preferences from localStorage
export function useSoundPreferences() {
  const getSoundEnabled = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('soundEffectsEnabled');
    return stored === null ? true : stored === 'true';
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('soundEffectsEnabled', String(enabled));
    window.dispatchEvent(new CustomEvent('soundPreferenceChanged', { detail: { enabled } }));
  }, []);

  const getVolume = useCallback(() => {
    if (typeof window === 'undefined') return 0.3;
    const stored = localStorage.getItem('soundEffectsVolume');
    return stored === null ? 0.3 : parseFloat(stored);
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (typeof window === 'undefined') return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundEffectsVolume', String(clampedVolume));
    window.dispatchEvent(new CustomEvent('soundVolumeChanged', { detail: { volume: clampedVolume } }));
  }, []);

  return {
    getSoundEnabled,
    setSoundEnabled,
    getVolume,
    setVolume,
  };
}
