import React, { createContext, useContext, useCallback, useRef, useMemo } from 'react';

interface AudioContextType {
  playOscillator: (
    frequency: number,
    delaySec?: number,
    duration?: number,
    volume?: number,
    type?: OscillatorType
  ) => void;
  getAudioContext: () => AudioContext | null;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return audioCtxRef.current;
  }, []);

  const playOscillator = useCallback(
    (
      frequency: number,
      delaySec: number = 0,
      duration: number = 0.2,
      volume: number = 0.3,
      type: OscillatorType = 'sine'
    ) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const startAt = ctx.currentTime + delaySec;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startAt);
        gainNode.gain.setValueAtTime(volume, startAt);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startAt);
        oscillator.stop(startAt + duration);
      } catch {
        // Audio playback failed silently — non-critical feature
      }
    },
    [getAudioContext]
  );

  const value = useMemo(
    () => ({ playOscillator, getAudioContext }),
    [playOscillator, getAudioContext]
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
};

export const useAudio = (): AudioContextType => {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
};
