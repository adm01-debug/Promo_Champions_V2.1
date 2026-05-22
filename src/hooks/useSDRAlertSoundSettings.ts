import { useState, useCallback, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';

export type SDRAlertSoundType = 'warning' | 'notification' | 'gentle' | 'chime' | 'none';

export interface SDRAlertSoundOption {
  id: SDRAlertSoundType;
  label: string;
  description: string;
}

export const sdrAlertSoundOptions: SDRAlertSoundOption[] = [
  { id: 'warning', label: 'Aviso', description: 'Tom de atenção moderado' },
  { id: 'notification', label: 'Notificação', description: 'Som suave de alerta' },
  { id: 'gentle', label: 'Suave', description: 'Tom discreto e profissional' },
  { id: 'chime', label: 'Sino', description: 'Som de sino melodioso' },
  { id: 'none', label: 'Sem som', description: 'Apenas notificação visual' },
];

const STORAGE_KEY = 'sdr-alert-sound-preference';
const VOLUME_STORAGE_KEY = 'sdr-alert-volume';

export function useSDRAlertSoundSettings() {
  const { playOscillator } = useAudio();
  const [selectedSound, setSelectedSound] = useState<SDRAlertSoundType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as SDRAlertSoundType) || 'warning';
    }
    return 'warning';
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

  const playSound = useCallback((soundType: SDRAlertSoundType = selectedSound) => {
    if (soundType === 'none' || volume === 0) return;

    switch (soundType) {
      case 'warning':
        playOscillator(523, 0, 0.15, 0.35 * volume, 'triangle');
        playOscillator(659, 0.15, 0.15, 0.35 * volume, 'triangle');
        playOscillator(523, 0.35, 0.15, 0.3 * volume, 'triangle');
        playOscillator(659, 0.5, 0.2, 0.3 * volume, 'triangle');
        break;
      
      case 'notification':
        playOscillator(440, 0, 0.12, 0.25 * volume, 'sine');
        playOscillator(554, 0.12, 0.12, 0.25 * volume, 'sine');
        playOscillator(659, 0.24, 0.18, 0.3 * volume, 'sine');
        break;
      
      case 'gentle':
        playOscillator(587, 0, 0.4, 0.25 * volume, 'sine');
        playOscillator(880, 0.15, 0.3, 0.15 * volume, 'sine');
        break;
      
      case 'chime':
        playOscillator(784, 0, 0.25, 0.3 * volume, 'sine');
        playOscillator(988, 0.1, 0.25, 0.25 * volume, 'sine');
        playOscillator(1175, 0.2, 0.35, 0.2 * volume, 'sine');
        playOscillator(784, 0.4, 0.15, 0.15 * volume, 'sine');
        break;
    }
  }, [playOscillator, selectedSound, volume]);

  const previewSound = useCallback((soundType: SDRAlertSoundType) => {
    playSound(soundType);
  }, [playSound]);

  return {
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    playSound,
    previewSound,
    soundOptions: sdrAlertSoundOptions,
  };
}