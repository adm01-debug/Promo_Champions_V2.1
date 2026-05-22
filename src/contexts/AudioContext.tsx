import React, { createContext, useContext, useRef, useCallback } from "react";

interface AudioContextType {
  playOscillator: (freq: number, startTime: number, duration: number, volume: number, type?: OscillatorType) => void;
  getAudioContext: () => AudioContext | null;
}

const AudioContextInstance = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }

    // Handle suspended state (browsers require user interaction)
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playOscillator = useCallback((freq: number, startTimeOffset: number, duration: number, volume: number, type: OscillatorType = "sine") => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const startTime = now + startTimeOffset;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }, [getAudioContext]);

  return (
    <AudioContextInstance.Provider value={{ playOscillator, getAudioContext }}>
      {children}
    </AudioContextInstance.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContextInstance);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};