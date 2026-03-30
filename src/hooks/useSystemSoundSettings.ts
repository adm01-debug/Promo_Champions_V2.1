import { useState, useCallback, useEffect } from 'react';

export type SystemSoundType = 'ding' | 'pop' | 'chime' | 'swoosh' | 'none';

export interface SystemSoundOption {
  id: SystemSoundType;
  label: string;
  description: string;
}

export const systemSoundOptions: SystemSoundOption[] = [
  { id: 'ding', label: 'Ding', description: 'Som suave de notificação' },
  { id: 'pop', label: 'Pop', description: 'Som curto e moderno' },
  { id: 'chime', label: 'Chime', description: 'Som melódico de sino' },
  { id: 'swoosh', label: 'Swoosh', description: 'Som de transição suave' },
  { id: 'none', label: 'Sem som', description: 'Apenas notificação visual' },
];

type SoundCategory = 'newTask' | 'newSale' | 'dealUpdate' | 'ready';

interface SystemSoundPreferences {
  newTask: { enabled: boolean; sound: SystemSoundType };
  newSale: { enabled: boolean; sound: SystemSoundType };
  dealUpdate: { enabled: boolean; sound: SystemSoundType };
  ready: { enabled: boolean };
}

const STORAGE_KEY = 'system-sound-preferences';
const VOLUME_STORAGE_KEY = 'system-sound-volume';

const defaultPreferences: SystemSoundPreferences = {
  newTask: { enabled: true, sound: 'ding' },
  newSale: { enabled: true, sound: 'chime' },
  dealUpdate: { enabled: true, sound: 'pop' },
  ready: { enabled: true },
};

export function useSystemSoundSettings() {
  const [preferences, setPreferences] = useState<SystemSoundPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultPreferences, ...JSON.parse(saved) };
        } catch (_e) {
          return defaultPreferences;
        }
      }
    }
    return defaultPreferences;
  });

  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
      return saved ? parseFloat(saved) : 0.5;
    }
    return 0.5;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
  }, [volume]);

  const updatePreference = useCallback(<K extends SoundCategory>(
    category: K,
    update: Partial<SystemSoundPreferences[K]>
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: { ...prev[category], ...update }
    }));
  }, []);

  const playSound = useCallback((soundType: SystemSoundType) => {
    if (soundType === 'none' || volume === 0) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      const playNote = (freq: number, startTime: number, duration: number, baseGain = 0.3, type: OscillatorType = 'sine') => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = type;
        
        const adjustedGain = baseGain * volume;
        gainNode.gain.setValueAtTime(adjustedGain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      switch (soundType) {
        case 'ding':
          playNote(1200, now, 0.2, 0.25);
          break;
        
        case 'pop':
          playNote(800, now, 0.08, 0.3);
          playNote(1000, now + 0.05, 0.1, 0.2);
          break;
        
        case 'chime':
          playNote(880, now, 0.15, 0.2);
          playNote(1100, now + 0.1, 0.15, 0.2);
          playNote(1320, now + 0.2, 0.2, 0.25);
          break;
        
        case 'swoosh': {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
          gain.gain.setValueAtTime(0.15 * volume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
      }
    } catch (_e) {
      // Silently fail if audio context not available
    }
  }, [volume]);

  const playSoundForCategory = useCallback((category: Exclude<SoundCategory, 'ready'>) => {
    const pref = preferences[category];
    if (pref.enabled && pref.sound !== 'none') {
      playSound(pref.sound);
    }
  }, [preferences, playSound]);

  const playReadySound = useCallback(() => {
    if (!preferences.ready.enabled || volume === 0) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.15 * volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (_e) {
      // Silently fail
    }
  }, [preferences.ready.enabled, volume]);

  const previewSound = useCallback((soundType: SystemSoundType) => {
    playSound(soundType);
  }, [playSound]);

  return {
    preferences,
    updatePreference,
    volume,
    setVolume,
    playSound,
    playSoundForCategory,
    playReadySound,
    previewSound,
    soundOptions: systemSoundOptions,
  };
}
