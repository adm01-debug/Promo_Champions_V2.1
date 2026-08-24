import { useState, useCallback, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';

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
const VOLUME_STORAGE_KEY = 'celebration-sound-volume';

export function useSoundSettings() {
  const { playOscillator } = useAudio();
  const [selectedSound, setSelectedSound] = useState<SoundType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as SoundType) || 'fanfare';
    }
    return 'fanfare';
  });

  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
      return saved ? parseFloat(saved) : 0.5;
    }
    return 0.5;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedSound);
  }, [selectedSound]);

  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
  }, [volume]);

  const playSound = useCallback((soundType: SoundType = selectedSound) => {
    if (soundType === 'none' || volume === 0) return;

    switch (soundType) {
      case 'fanfare':
        playOscillator(523.25, 0, 0.15, 0.3 * volume);
        playOscillator(659.25, 0.1, 0.15, 0.3 * volume);
        playOscillator(783.99, 0.2, 0.15, 0.3 * volume);
        playOscillator(1046.50, 0.3, 0.3, 0.3 * volume);
        break;
      
      case 'chime':
        playOscillator(880, 0, 0.4, 0.2 * volume);
        playOscillator(1108.73, 0.15, 0.35, 0.2 * volume);
        playOscillator(1318.51, 0.3, 0.4, 0.15 * volume);
        break;
      
      case 'bell':
        playOscillator(659.25, 0, 0.5, 0.25 * volume);
        playOscillator(830.61, 0, 0.5, 0.15 * volume);
        playOscillator(987.77, 0.1, 0.4, 0.2 * volume);
        playOscillator(1318.51, 0.2, 0.5, 0.15 * volume);
        break;
      
      case 'success':
        playOscillator(440, 0, 0.1, 0.25 * volume);
        playOscillator(554.37, 0.08, 0.1, 0.25 * volume);
        playOscillator(659.25, 0.16, 0.1, 0.25 * volume);
        playOscillator(880, 0.24, 0.25, 0.3 * volume);
        break;
    }
  }, [playOscillator, selectedSound, volume]);

  const previewSound = useCallback((soundType: SoundType) => {
    playSound(soundType);
  }, [playSound]);

  return {
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    playSound,
    previewSound,
    soundOptions,
  };
}