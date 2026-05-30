import React, { createContext, useContext, useCallback, useRef, useMemo } from 'react';

interface AudioContextType {
  playOscillator: (type: OscillatorType, frequency: number, duration: number, volume?: number) => void;
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
    (type: OscillatorType, frequency: number, duration: number, volume: number = 0.3) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
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
