import { useState, useCallback, useEffect } from 'react';

export type SoundType = 'fanfare' | 'chime' | 'bell' | 'success' | 'none';

export interface SoundOption {
  id: SoundType;
  label: string;
  description: string;
}

export const soundOptions: SoundOption[] = [
  { id: 'fanfare', label: 'Fanfarra', description: 'Som clássico de vitória' },
  { id: 'chime', label: 'Chime', description: 'Som suave e elegante' },
  { id: 'bell', label: 'Sino', description: 'Som de sino celebrando' },
  { id: 'success', label: 'Sucesso', description: 'Tom ascendente positivo' },
  { id: 'none', label: 'Sem som', description: 'Apenas animação visual' },
];

const STORAGE_KEY = 'celebration-sound-preference';

export function useSoundSettings() {
  const [selectedSound, setSelectedSound] = useState<SoundType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as SoundType) || 'fanfare';
    }
    return 'fanfare';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedSound);
  }, [selectedSound]);

  const playSound = useCallback((soundType: SoundType = selectedSound) => {
    if (soundType === 'none') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNote = (freq: number, startTime: number, duration: number, gain = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(gain, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;

    switch (soundType) {
      case 'fanfare':
        // Victory fanfare (C-E-G-C)
        playNote(523.25, now, 0.15);
        playNote(659.25, now + 0.1, 0.15);
        playNote(783.99, now + 0.2, 0.15);
        playNote(1046.50, now + 0.3, 0.3);
        break;
      
      case 'chime':
        // Gentle chime (ascending)
        playNote(880, now, 0.4, 0.2);
        playNote(1108.73, now + 0.15, 0.35, 0.2);
        playNote(1318.51, now + 0.3, 0.4, 0.15);
        break;
      
      case 'bell':
        // Bell sound (rich harmonics)
        playNote(659.25, now, 0.5, 0.25);
        playNote(830.61, now, 0.5, 0.15);
        playNote(987.77, now + 0.1, 0.4, 0.2);
        playNote(1318.51, now + 0.2, 0.5, 0.15);
        break;
      
      case 'success':
        // Success tone (quick ascending)
        playNote(440, now, 0.1, 0.25);
        playNote(554.37, now + 0.08, 0.1, 0.25);
        playNote(659.25, now + 0.16, 0.1, 0.25);
        playNote(880, now + 0.24, 0.25, 0.3);
        break;
    }
  }, [selectedSound]);

  const previewSound = useCallback((soundType: SoundType) => {
    playSound(soundType);
  }, [playSound]);

  return {
    selectedSound,
    setSelectedSound,
    playSound,
    previewSound,
    soundOptions,
  };
}
