import { useState, useCallback, useEffect } from 'react';

export type SecurityAlertSoundType = 'alarm' | 'siren' | 'beep' | 'urgent' | 'none';

export interface SecurityAlertSoundOption {
  id: SecurityAlertSoundType;
  label: string;
  description: string;
}

export const securityAlertSoundOptions: SecurityAlertSoundOption[] = [
  { id: 'alarm', label: 'Alarme', description: 'Tom descendente de alerta' },
  { id: 'siren', label: 'Sirene', description: 'Som de sirene alternado' },
  { id: 'beep', label: 'Bipe', description: 'Bipes curtos repetidos' },
  { id: 'urgent', label: 'Urgente', description: 'Tom grave e intenso' },
  { id: 'none', label: 'Sem som', description: 'Apenas notificação visual' },
];

const STORAGE_KEY = 'security-alert-sound-preference';
const VOLUME_STORAGE_KEY = 'security-alert-volume';

export function useSecurityAlertSoundSettings() {
  const [selectedSound, setSelectedSound] = useState<SecurityAlertSoundType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as SecurityAlertSoundType) || 'alarm';
    }
    return 'alarm';
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

  const playSound = useCallback((soundType: SecurityAlertSoundType = selectedSound) => {
    if (soundType === 'none' || volume === 0) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    const playNote = (freq: number, startTime: number, duration: number, baseGain = 0.4, type: OscillatorType = 'square') => {
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
      case 'alarm':
        playNote(880, now, 0.15);
        playNote(660, now + 0.15, 0.15);
        playNote(880, now + 0.3, 0.15);
        playNote(660, now + 0.45, 0.2);
        break;
      
      case 'siren':
        playNote(800, now, 0.2, 0.35, 'sawtooth');
        playNote(600, now + 0.2, 0.2, 0.35, 'sawtooth');
        playNote(800, now + 0.4, 0.2, 0.35, 'sawtooth');
        playNote(600, now + 0.6, 0.2, 0.35, 'sawtooth');
        break;
      
      case 'beep':
        playNote(1000, now, 0.1, 0.3, 'sine');
        playNote(1000, now + 0.15, 0.1, 0.3, 'sine');
        playNote(1000, now + 0.3, 0.1, 0.3, 'sine');
        playNote(1000, now + 0.45, 0.15, 0.35, 'sine');
        break;
      
      case 'urgent':
        playNote(200, now, 0.3, 0.5, 'square');
        playNote(150, now + 0.3, 0.3, 0.5, 'square');
        playNote(200, now + 0.6, 0.25, 0.4, 'square');
        break;
    }
  }, [selectedSound, volume]);

  const previewSound = useCallback((soundType: SecurityAlertSoundType) => {
    playSound(soundType);
  }, [playSound]);

  return {
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    playSound,
    previewSound,
    soundOptions: securityAlertSoundOptions,
  };
}
