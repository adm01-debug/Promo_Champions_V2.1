import { useState, useCallback, useEffect } from 'react';

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
      case 'warning':
        // Two-tone warning - attention-grabbing but not alarming
        playNote(523, now, 0.15, 0.35, 'triangle'); // C5
        playNote(659, now + 0.15, 0.15, 0.35, 'triangle'); // E5
        playNote(523, now + 0.35, 0.15, 0.3, 'triangle'); // C5
        playNote(659, now + 0.5, 0.2, 0.3, 'triangle'); // E5
        break;
      
      case 'notification':
        // Soft notification - gentle ascending tones
        playNote(440, now, 0.12, 0.25, 'sine'); // A4
        playNote(554, now + 0.12, 0.12, 0.25, 'sine'); // C#5
        playNote(659, now + 0.24, 0.18, 0.3, 'sine'); // E5
        break;
      
      case 'gentle':
        // Single soft tone with fade
        playNote(587, now, 0.4, 0.25, 'sine'); // D5
        playNote(880, now + 0.15, 0.3, 0.15, 'sine'); // A5 (soft overlay)
        break;
      
      case 'chime':
        // Melodic chime - pleasant bell-like sound
        playNote(784, now, 0.25, 0.3, 'sine'); // G5
        playNote(988, now + 0.1, 0.25, 0.25, 'sine'); // B5
        playNote(1175, now + 0.2, 0.35, 0.2, 'sine'); // D6
        playNote(784, now + 0.4, 0.15, 0.15, 'sine'); // G5
        break;
    }
  }, [selectedSound, volume]);

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
